import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { storage } from "../utils/storage.utils";
import { authService } from "../api/services/auth.service";
import { usersService } from "../api/services/users.service";
import { MeResponse, User } from "../types";
import { handleApiError } from "../utils";
import Toast from "react-native-toast-message";

interface AuthContextType {
  user: User | null;
  me: MeResponse | null;
  token: string | null;
  isLoading: boolean;
  login: (
    username: string,
    password: string,
  ) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
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
        console.warn("Background fetchMe error:", apiError.message);
      }
      return null;
    }
  };

  useEffect(() => {
    const loadFromStorage = async () => {
      const storedToken = await storage.getItem(".auth_token");
      const storedUser = await storage.getItem(".auth_user");

      if (storedToken && storedUser) {
        setToken(storedToken);
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsLoading(false);
        await fetchMe();
      } else {
        setIsLoading(false);
      }
    };

    loadFromStorage();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await authService.login(username, password);
      const { token, user } = response.data;
      await storage.setItem(".auth_token", token);
      await storage.setItem(".auth_user", JSON.stringify(user));
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
    await storage.deleteItem(".auth_token");
    await storage.deleteItem(".auth_user");
    setToken(null);
    setUser(null);
    setMe(null);
  };

  const refreshMe = async () => {
    await fetchMe();
  };

  return (
    <AuthContext.Provider
      value={{ user, me, token, isLoading, login, logout, refreshMe }}
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
