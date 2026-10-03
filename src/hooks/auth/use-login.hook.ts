import { useForm } from "../use-form.hook";
import { useAuth } from "../../contexts";
import { Alert } from "react-native";
import { useTranslate } from "../i18n";
import {
  DEFAULT_REMEMBER_OPTION,
  toRememberChoice,
  type RememberOption,
} from "../../constants";

export const useLogin = () => {
  const { t } = useTranslate();
  const { login } = useAuth();

  const form = useForm({
    initialValues: {
      username: "",
      password: "",
      remember: DEFAULT_REMEMBER_OPTION as RememberOption,
    },
    validate: (values) => {
      const errors: any = {};
      if (!values.username.trim())
        errors.username = t("auth.errors.usernameRequired");
      if (!values.password.trim())
        errors.password = t("auth.errors.passwordRequired");
      return errors;
    },
    onSubmit: async (values) => {
      const result = await login(
        values.username,
        values.password,
        toRememberChoice(values.remember),
      );
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
    remember: form.values.remember,
    setRemember: (value: RememberOption) =>
      form.setFieldValue("remember", value),
    errors: form.errors,
    loading: form.isSubmitting,
    handleLogin: form.handleSubmit,
  };
};
