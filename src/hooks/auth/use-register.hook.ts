import { useForm } from "../use-form.hook";
import { useAuth } from "../../contexts";
import { Alert } from "react-native";
import { useTranslate } from "../i18n";
import {
  DEFAULT_REMEMBER_OPTION,
  toRememberChoice,
  type RememberOption,
} from "../../constants";

export const useRegister = () => {
  const { t } = useTranslate();
  const { register } = useAuth();

  const form = useForm({
    initialValues: {
      username: "",
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      remember: DEFAULT_REMEMBER_OPTION as RememberOption,
      terms: false,
    },
    validate: (values) => {
      const errors: any = {};
      if (!values.username.trim())
        errors.username = t("auth.errors.usernameRequired");
      if (!values.name.trim()) errors.name = t("auth.errors.nameRequired");
      if (!values.email.trim()) errors.email = t("auth.errors.emailRequired");
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim()))
        errors.email = t("auth.errors.emailInvalid");
      if (!values.password.trim())
        errors.password = t("auth.errors.passwordRequired");
      else if (values.password.length < 6)
        errors.password = t("auth.errors.passwordTooShort");
      if (values.confirmPassword !== values.password)
        errors.confirmPassword = t("auth.errors.passwordMismatch");
      if (!values.terms) errors.terms = t("auth.terms.required");
      return errors;
    },
    onSubmit: async (values) => {
      const result = await register(
        values.username.trim(),
        values.password,
        values.name.trim(),
        values.email.trim().toLowerCase(),
        toRememberChoice(values.remember),
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
    email: form.values.email,
    setEmail: (text: string) => form.setFieldValue("email", text),
    password: form.values.password,
    setPassword: (text: string) => form.setFieldValue("password", text),
    confirmPassword: form.values.confirmPassword,
    setConfirmPassword: (text: string) =>
      form.setFieldValue("confirmPassword", text),
    remember: form.values.remember,
    setRemember: (value: RememberOption) =>
      form.setFieldValue("remember", value),
    terms: form.values.terms,
    setTerms: (value: boolean) => form.setFieldValue("terms", value),
    errors: form.errors,
    loading: form.isSubmitting,
    handleRegister: form.handleSubmit,
  };
};
