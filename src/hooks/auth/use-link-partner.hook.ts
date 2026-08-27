import { Alert } from "react-native";

import { useAuth } from "../../contexts";
import { usersService } from "../../api";
import { getPartner } from "../../utils";

import { useForm } from "../use-form.hook";

export const useLinkPartner = () => {
  const { me, refreshMe } = useAuth();
  const partner = getPartner(me);
  const isLinked = !!me?.pair;

  const form = useForm({
    initialValues: { partnerUsername: "" },
    validate: (values) => {
      const errors: any = {};
      if (!values.partnerUsername.trim()) {
        errors.partnerUsername = "Введите имя пользователя";
      }
      return errors;
    },
    onSubmit: async (values) => {
      await usersService.linkPartner(values.partnerUsername.trim());
      await refreshMe();
      Alert.alert("Успех", "Партнёр успешно привязан!");
      form.reset();
    },
  });

  const handleLink = async () => {
    try {
      await form.handleSubmit();
    } catch (error: any) {
      Alert.alert(
        "Ошибка",
        error.response?.data?.message || "Не удалось привязать",
      );
    }
  };

  return {
    partner,
    partnerUsername: form.values.partnerUsername,
    setPartnerUsername: (text: string) =>
      form.setFieldValue("partnerUsername", text),
    loading: form.isSubmitting,
    handleLink,
    isLinked,
  };
};
