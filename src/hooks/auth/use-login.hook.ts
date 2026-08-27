import { useState } from "react";
import { Alert } from "react-native";
import { useAuth } from "../../contexts";

export const useLogin = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert("Ошибка", "Заполните все поля");
      return;
    }

    setLoading(true);
    const result = await login(username, password);
    setLoading(false);

    if (!result.success) {
      Alert.alert("Ошибка", result.message || "Неверные данные");
    }
  };

  return {
    username,
    setUsername,
    password,
    setPassword,
    loading,
    handleLogin,
  };
};
