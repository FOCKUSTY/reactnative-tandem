import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { storage } from "../utils/storage";
import { authService } from "../api/services/auth.service";
import { usersService } from "../api/services/users.service";
import { MeResponse, User } from "../types";
import { handleApiError } from "../utils/errorHandler";

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

  useEffect(() => {
    const loadStorage = async () => {
      const storedToken = await storage.getItem(".auth_token");
      const storedUser = await storage.getItem(".auth_user");
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        await fetchMe();
      }
      setIsLoading(false);
    };
    loadStorage();
  }, []);

  const fetchMe = async () => {
    try {
      const response = await usersService.getMe();
      setMe(response.data);
      if (response.data) {
        setUser({
          id: response.data.id,
          username: response.data.username,
          name: response.data.name,
        });
      }
    } catch (error) {
      console.warn("Failed to fetch user data:", error);
    }
  };

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

  const refreshMe = fetchMe;

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
