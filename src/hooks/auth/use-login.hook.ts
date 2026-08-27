import { useForm } from "../use-form.hook";
import { useAuth } from "../../contexts";
import { Alert } from "react-native";

export const useLogin = () => {
  const { login } = useAuth();

  const form = useForm({
    initialValues: { username: "", password: "" },
    validate: (values) => {
      const errors: any = {};
      if (!values.username.trim()) errors.username = "Введите имя";
      if (!values.password.trim()) errors.password = "Введите пароль";
      return errors;
    },
    onSubmit: async (values) => {
      const result = await login(values.username, values.password);
      if (!result.success) {
        Alert.alert("Ошибка", result.message || "Неверные данные");
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
