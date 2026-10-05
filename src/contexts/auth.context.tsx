import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react";
import Toast from "react-native-toast-message";

import { authService } from "../api/services/auth.service";
import { usersService } from "../api/services/users.service";
import { pushService } from "../api";
import { notificationService } from "../services/notification.service";
import { STORAGE_KEYS } from "../constants";
import {
  authEvents,
  getDeviceId,
  getDeviceMetadata,
  handleApiError,
  logger,
  storage,
  tokenManager,
} from "../utils";
import {
  clearTemplateIdentity,
  setTemplateIdentity,
} from "../template/identity";
import type {
  AuthResponse,
  AuthSession,
  MeResponse,
  RememberChoice,
  User,
} from "../types";
import { useTranslate } from "../hooks/i18n/use-translation.hook";

type AuthResult = { success: boolean; message?: string };

interface AuthContextType {
  user: User | null;
  me: MeResponse | null;
  session: AuthSession | null;
  accessToken: string | null;
  refreshToken: string | null;
  sessionId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    username: string,
    password: string,
    remember?: RememberChoice,
  ) => Promise<AuthResult>;
  register: (
    username: string,
    password: string,
    name: string,
    email: string,
    remember?: RememberChoice,
  ) => Promise<AuthResult>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
  /** Сохранить пару токенов, выданную вне login/register (смена пароля). */
  replaceSession: (auth: AuthResponse) => Promise<void>;
  updateProfile: (data: {
    name?: string;
    username?: string;
    email?: string;
  }) => Promise<AuthResult>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { t } = useTranslate();
  const [user, setUser] = useState<User | null>(null);
  const [me, setMe] = useState<MeResponse | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const translateRef = useRef(t);
  useEffect(() => {
    translateRef.current = t;
  }, [t]);

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
      void logger.warn("Background fetchMe error", {
        message: apiError.message,
        status: apiError.status,
      });
      return null;
    }
  };

  /** Стирает сессию и локальные данные пользователя, не трогая сервер. */
  const clearLocalSession = useCallback(async () => {
    await tokenManager.clear();
    await tokenManager.clearLegacyKeys();
    await Promise.all([
      storage.deleteItem(STORAGE_KEYS.AUTH_USER),
      storage.deleteItem(STORAGE_KEYS.AUTH_ME),
      storage.deleteItem(STORAGE_KEYS.PUSH_TOKEN),
    ]);
    setSession(null);
    setUser(null);
    setMe(null);
  }, []);

  /** Сохраняет выданную пару токенов и подтягивает профиль. */
  const applyAuthResponse = async (auth: AuthResponse) => {
    const next = await tokenManager.persist(auth);
    await storage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(auth.user));
    setSession(next);
    setUser(auth.user);
    await fetchMe();
  };

  /** Держит состояние контекста в согласии с хранилищем после ротации токенов. */
  const syncSessionFromStorage = useCallback(async () => {
    const stored = await tokenManager.getSession();
    if (stored) setSession(stored);
  }, []);

  useEffect(() => {
    return authEvents.subscribe((event, payload) => {
      if (event === "refreshed") {
        void syncSessionFromStorage();
        return;
      }

      void clearLocalSession();

      if (event !== "expired") return;

      const reused = payload.reason === "refreshTokenReused";
      Toast.show({
        type: "error",
        text1: translateRef.current(
          reused
            ? "auth.sessionExpired.reusedTitle"
            : "auth.sessionExpired.title",
        ),
        text2: translateRef.current(
          reused
            ? "auth.sessionExpired.reusedMessage"
            : "auth.sessionExpired.message",
        ),
        position: "bottom",
        visibilityTime: 4000,
      });
    });
  }, [clearLocalSession, syncSessionFromStorage]);

  useEffect(() => {
    const loadFromStorage = async () => {
      await tokenManager.clearLegacyKeys();

      const storedSession = await tokenManager.getSession();
      if (!storedSession) {
        setIsLoading(false);
        return;
      }

      setSession(storedSession);

      const storedUser = await storage.getItem(STORAGE_KEYS.AUTH_USER);
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {}
      }

      const storedMe = await storage.getItem(STORAGE_KEYS.AUTH_ME);
      if (storedMe) {
        try {
          setMe(JSON.parse(storedMe));
        } catch {}
      }

      setIsLoading(false);
      await fetchMe();
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

  useEffect(() => {
    if (!me) {
      clearTemplateIdentity();
      return;
    }

    const toMember = (u: { id: string; name: string; username: string }) => ({
      id: u.id,
      name: u.name || u.username,
      username: u.username,
    });

    const members = me.pair
      ? [toMember(me.pair.userA), toMember(me.pair.userB)]
      : [toMember(me)];

    setTemplateIdentity({
      currentUserId: me.id,
      members,
    });
  }, [me]);

  const login = async (
    username: string,
    password: string,
    remember?: RememberChoice,
  ): Promise<AuthResult> => {
    try {
      const device = await getDeviceMetadata();
      const response = await authService.login(
        username,
        password,
        remember,
        device,
      );
      await applyAuthResponse(response.data);
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
    remember?: RememberChoice,
  ): Promise<AuthResult> => {
    try {
      const device = await getDeviceMetadata();
      const response = await authService.register(
        username,
        password,
        name,
        email,
        remember,
        device,
      );
      await applyAuthResponse(response.data);
      return { success: true };
    } catch (error) {
      const apiError = handleApiError(error);
      return { success: false, message: apiError.message };
    }
  };

  const logout = async () => {
    try {
      await notificationService.cancelAll();
    } catch (error) {
      void logger.warn("Failed to cancel notifications on logout", {
        error: error instanceof Error ? error.message : String(error),
      });
    }

    try {
      const deviceId = await getDeviceId();
      await pushService.unregisterDevice(deviceId);
    } catch (error) {
      void logger.warn("Failed to unregister device on logout", {
        error: error instanceof Error ? error.message : String(error),
      });
    }

    try {
      const refreshToken = await tokenManager.getRefreshToken();
      if (refreshToken) await authService.logout(refreshToken);
    } catch (error) {
      void logger.warn("Failed to revoke session on logout", {
        error: error instanceof Error ? error.message : String(error),
      });
    }

    await clearLocalSession();
    authEvents.emit("logout");
  };

  const updateProfile = async (data: {
    name?: string;
    username?: string;
    email?: string;
  }): Promise<AuthResult> => {
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

  const refreshMe = async () => {
    await fetchMe();
  };

  /**
   * То же, что сохраняет login/register, но без похода за профилем: смена
   * пароля профиль не меняет, а старые токены и sessionId в контексте держать
   * нельзя — сервер их уже отозвал.
   */
  const replaceSession = async (auth: AuthResponse) => {
    setSession(await tokenManager.persist(auth));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        me,
        session,
        accessToken: session?.accessToken ?? null,
        refreshToken: session?.refreshToken ?? null,
        sessionId: session?.sessionId ?? null,
        isAuthenticated: !!session,
        isLoading,
        login,
        logout,
        refreshMe,
        replaceSession,
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
