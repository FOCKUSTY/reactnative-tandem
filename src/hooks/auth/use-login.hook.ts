import { useForm } from "../use-form.hook";
import { useAuth } from "../../contexts";
import { Alert } from "react-native";
import { useTranslate } from "../i18n";

export const useLogin = () => {
  const { t } = useTranslate();
  const { login } = useAuth();

  const form = useForm({
    initialValues: { username: "", password: "" },
    validate: (values) => {
      const errors: any = {};
      if (!values.username.trim())
        errors.username = t("auth.errors.usernameRequired");
      if (!values.password.trim())
        errors.password = t("auth.errors.passwordRequired");
      return errors;
    },
    onSubmit: async (values) => {
      const result = await login(values.username, values.password);
      if (!result.success) {
        Alert.alert(
          t("common.error"),
          result.message || t("auth.errors.invalidCredentials"),
        );
        throw new Error(result.message);
      }
    },
  });

  return {
    username: form.values.username,
    setUsername: (text: string) => form.setFieldValue("username", text),
    password: form.values.password,
    setPassword: (text: string) => form.setFieldValue("password", text),
    loading: form.isSubmitting,
    handleLogin: form.handleSubmit,
  };
};
