import { useState } from "react";
import { View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { LoginForm, RegisterForm, SkeletonLogin } from "../components";
import { createStyles } from "../utils";
import { useTheme } from "../contexts";
import { useLogin, useRegister } from "../hooks";
import type { NavigationProperty } from "../types";

type Mode = "login" | "register";

export const LoginScreen = () => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [mode, setMode] = useState<Mode>("login");
  const navigation = useNavigation<NavigationProperty>();

  const login = useLogin();
  const register = useRegister();

  if (login.loading || register.loading) {
    return <SkeletonLogin />;
  }

  return (
    <View style={styles.container}>
      {mode === "login" ? (
        <LoginForm
          username={login.username}
          setUsername={login.setUsername}
          password={login.password}
          setPassword={login.setPassword}
          remember={login.remember}
          setRemember={login.setRemember}
          loading={login.loading}
          onSubmit={login.handleLogin}
          onSwitchToRegister={() => setMode("register")}
          onForgotPassword={() => navigation.navigate("ForgotPassword")}
        />
      ) : (
        <RegisterForm
          username={register.username}
          setUsername={register.setUsername}
          name={register.name}
          setName={register.setName}
          email={register.email}
          setEmail={register.setEmail}
          password={register.password}
          setPassword={register.setPassword}
          confirmPassword={register.confirmPassword}
          setConfirmPassword={register.setConfirmPassword}
          remember={register.remember}
          setRemember={register.setRemember}
          loading={register.loading}
          onSubmit={register.handleRegister}
          onSwitchToLogin={() => setMode("login")}
        />
      )}
    </View>
  );
};

const getStyles = createStyles((colors) => ({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: colors.background,
  },
}));

export default LoginScreen;
