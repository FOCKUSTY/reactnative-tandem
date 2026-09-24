import { useForm } from "../use-form.hook";
import { useAuth } from "../../contexts";
import { Alert } from "react-native";
import { useTranslate } from "../i18n";

export const useRegister = () => {
  const { t } = useTranslate();
  const { register } = useAuth();

  const form = useForm({
    initialValues: {
      username: "",
      name: "",
      password: "",
      confirmPassword: "",
    },
    validate: (values) => {
      const errors: any = {};
      if (!values.username.trim())
        errors.username = t("auth.errors.usernameRequired");
      if (!values.name.trim()) errors.name = t("auth.errors.nameRequired");
      if (!values.password.trim())
        errors.password = t("auth.errors.passwordRequired");
      else if (values.password.length < 6)
        errors.password = t("auth.errors.passwordTooShort");
      if (values.confirmPassword !== values.password)
        errors.confirmPassword = t("auth.errors.passwordMismatch");
      return errors;
    },
    onSubmit: async (values) => {
      const result = await register(
        values.username.trim(),
        values.password,
        values.name.trim(),
      );
      if (!result.success) {
        Alert.alert(
          t("common.error"),
          result.message || t("auth.errors.registerFailed"),
        );
        throw new Error(result.message);
      }
    },
  });

  return {
    username: form.values.username,
    setUsername: (text: string) => form.setFieldValue("username", text),
    name: form.values.name,
    setName: (text: string) => form.setFieldValue("name", text),
    password: form.values.password,
    setPassword: (text: string) => form.setFieldValue("password", text),
    confirmPassword: form.values.confirmPassword,
    setConfirmPassword: (text: string) =>
      form.setFieldValue("confirmPassword", text),
    loading: form.isSubmitting,
    handleRegister: form.handleSubmit,
  };
};
