import { View } from "react-native";

import { LoginForm, SkeletonLogin } from "../components";
import { createStyles } from "../utils";
import { useTheme } from "../contexts";
import { useLogin } from "../hooks";

export const LoginScreen = () => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { username, setUsername, password, setPassword, loading, handleLogin } =
    useLogin();

  if (loading) {
    return <SkeletonLogin />;
  }

  return (
    <View style={styles.container}>
      <LoginForm
        username={username}
        setUsername={setUsername}
        password={password}
        setPassword={setPassword}
        loading={loading}
        onSubmit={handleLogin}
      />
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
