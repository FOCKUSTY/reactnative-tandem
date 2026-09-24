import { useState, useEffect } from "react";
import { storage } from "../../utils/storage.utils";
import { usersService } from "../../api/services/users.service";
import { User, MeResponse } from "../../types";
import { handleApiError, logger } from "../../utils";
import Toast from "react-native-toast-message";

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [me, setMe] = useState<MeResponse | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshMe = async (): Promise<MeResponse | null> => {
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
        await storage.deleteItem(".auth_token");
        await storage.deleteItem(".auth_user");
        setToken(null);
        setUser(null);
        setMe(null);
        Toast.show({
          type: "error",
          text1: "Сессия истекла",
          text2: "Пожалуйста, войдите снова.",
          position: "bottom",
          visibilityTime: 4000,
        });
      } else {
        void logger.warn("Background refreshMe error", {
          message: apiError.message,
          status: apiError.status,
        });
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
        setUser(JSON.parse(storedUser));
        setIsLoading(false);
        await refreshMe();
      } else {
        setIsLoading(false);
      }
    };

    loadFromStorage();
  }, []);

  return { user, me, token, isLoading, refreshMe };
};
