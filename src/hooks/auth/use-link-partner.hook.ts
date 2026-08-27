import { useState } from "react";
import { Alert } from "react-native";
import { useAuth } from "../../contexts/auth.context";
import { usersService } from "../../api/services/users.service";
import { getPartner } from "../../utils/partner.utils";

export const useLinkPartner = () => {
  const { me, refreshMe } = useAuth();
  const [partnerUsername, setPartnerUsername] = useState("");
  const [loading, setLoading] = useState(false);

  const partner = getPartner(me);

  const handleLink = async () => {
    if (!partnerUsername.trim()) {
      Alert.alert("Ошибка", "Введите имя пользователя партнёра");
      return;
    }
    setLoading(true);
    try {
      await usersService.linkPartner(partnerUsername.trim());
      await refreshMe();
      Alert.alert("Успех", "Партнёр успешно привязан!");
      setPartnerUsername("");
    } catch (error: any) {
      Alert.alert(
        "Ошибка",
        error.response?.data?.message || "Не удалось привязать",
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    partner,
    partnerUsername,
    setPartnerUsername,
    loading,
    handleLink,
    isLinked: !!me?.pair,
  };
};
