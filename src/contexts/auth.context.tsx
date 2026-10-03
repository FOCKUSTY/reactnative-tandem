import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { storage, getDeviceId, handleApiError, logger } from "../utils";
import { authService } from "../api/services/auth.service";
import { usersService } from "../api/services/users.service";
import { MeResponse, User } from "../types";
import Toast from "react-native-toast-message";
import { pushService } from "../api";
import { notificationService } from "../services/notification.service";
import { STORAGE_KEYS } from "../constants";

interface AuthContextType {
  user: User | null;
  me: MeResponse | null;
  token: string | null;
  isLoading: boolean;
  login: (
    username: string,
    password: string,
  ) => Promise<{ success: boolean; message?: string }>;
  register: (
    username: string,
    password: string,
    name: string,
    email: string,
  ) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
  updateProfile: (data: {
    name?: string;
    username?: string;
    email?: string;
  }) => Promise<{ success: boolean; message?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [me, setMe] = useState<MeResponse | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMe = async (): Promise<MeResponse | null> => {
    try {
      const response = await usersService.getMe();
      const meData = response.data;
      setMe(meData);
      if (meData) {
        setUser({
          id: meData.id,
          username: meData.username,
          name: meData.name,
        });
      }
      return meData;
    } catch (error) {
      const apiError = handleApiError(error);
      if (apiError.status === 401) {
        await logout();
        Toast.show({
          type: "error",
          text1: "Сессия истекла",
          text2: "Пожалуйста, войдите снова.",
          position: "bottom",
          visibilityTime: 4000,
        });
      } else {
        void logger.warn("Background fetchMe error", {
          message: apiError.message,
          status: apiError.status,
        });
      }
      return null;
    }
  };

  useEffect(() => {
    const loadFromStorage = async () => {
      const storedToken = await storage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      const storedUser = await storage.getItem(STORAGE_KEYS.AUTH_USER);
      const storedMe = await storage.getItem(STORAGE_KEYS.AUTH_ME);

      if (storedToken && storedUser) {
        setToken(storedToken);
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        if (storedMe) {
          try {
            setMe(JSON.parse(storedMe));
          } catch {}
        }
        setIsLoading(false);
        await fetchMe();
      } else {
        setIsLoading(false);
      }
    };

    loadFromStorage();
  }, []);

  useEffect(() => {
    if (!me) return;
    storage.setItem(STORAGE_KEYS.AUTH_ME, JSON.stringify(me)).catch((e) => {
      void logger.warn("Failed to persist me", {
        error: e instanceof Error ? e.message : String(e),
      });
    });
  }, [me]);

  const login = async (username: string, password: string) => {
    try {
      const response = await authService.login(username, password);
      const { token, user } = response.data;
      await storage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      await storage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
      setToken(token);
      setUser(user);
      await fetchMe();
      return { success: true };
    } catch (error) {
      const apiError = handleApiError(error);
      return { success: false, message: apiError.message };
    }
  };

  const logout = async () => {
    await notificationService.cancelAll();
    await storage.deleteItem(STORAGE_KEYS.AUTH_TOKEN);
    await storage.deleteItem(STORAGE_KEYS.AUTH_USER);
    await storage.deleteItem(STORAGE_KEYS.AUTH_ME);
    await storage.deleteItem(STORAGE_KEYS.PUSH_TOKEN);
    setToken(null);
    setUser(null);
    setMe(null);

    const deviceId = await getDeviceId();
    await pushService.unregisterDevice(deviceId);
  };

  const updateProfile = async (data: {
    name?: string;
    username?: string;
    email?: string;
  }) => {
    try {
      const response = await usersService.updateMe(data);
      const meData = response.data;
      setMe(meData);
      setUser({
        id: meData.id,
        username: meData.username,
        name: meData.name,
        email: meData.email,
      });
      await storage.setItem(
        STORAGE_KEYS.AUTH_USER,
        JSON.stringify({
          id: meData.id,
          username: meData.username,
          name: meData.name,
          email: meData.email,
        }),
      );
      return { success: true };
    } catch (error) {
      const apiError = handleApiError(error);
      return { success: false, message: apiError.message };
    }
  };

  const register = async (
    username: string,
    password: string,
    name: string,
    email: string,
  ) => {
    try {
      const response = await authService.register(
        username,
        password,
        name,
        email,
      );
      const { token, user } = response.data;
      await storage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      await storage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
      setToken(token);
      setUser(user);
      await fetchMe();
      return { success: true };
    } catch (error) {
      const apiError = handleApiError(error);
      return { success: false, message: apiError.message };
    }
  };

  const refreshMe = async () => {
    await fetchMe();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        me,
        token,
        isLoading,
        login,
        logout,
        refreshMe,
        register,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
