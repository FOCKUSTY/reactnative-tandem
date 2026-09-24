import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useTheme } from "../../contexts";
import { createStyles } from "../../utils";
import { useTranslate } from "../../hooks";

export type RegisterFormProperties = {
  username: string;
  setUsername: (text: string) => void;
  name: string;
  setName: (text: string) => void;
  password: string;
  setPassword: (text: string) => void;
  confirmPassword: string;
  setConfirmPassword: (text: string) => void;
  loading: boolean;
  onSubmit: () => void;
  onSwitchToLogin?: () => void;
};

export const RegisterForm = ({
  username,
  setUsername,
  name,
  setName,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  loading,
  onSubmit,
  onSwitchToLogin,
}: RegisterFormProperties) => {
  const { colors } = useTheme();
  const { t } = useTranslate();
  const styles = getStyles(colors);

  return (
    <View>
      <Text style={styles.title}>{t("auth.registerTitle")}</Text>

      <TextInput
        style={styles.input}
        placeholder={t("auth.username")}
        placeholderTextColor={colors.textMuted}
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder={t("auth.name")}
        placeholderTextColor={colors.textMuted}
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder={t("auth.password")}
        placeholderTextColor={colors.textMuted}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder={t("auth.confirmPassword")}
        placeholderTextColor={colors.textMuted}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={onSubmit}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? t("auth.registerLoading") : t("auth.register")}
        </Text>
      </TouchableOpacity>

      {onSwitchToLogin && (
        <TouchableOpacity style={styles.switchButton} onPress={onSwitchToLogin}>
          <Text style={styles.switchText}>
            {t("auth.haveAccount")}{" "}
            <Text style={styles.switchLink}>{t("auth.login")}</Text>
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const getStyles = createStyles((colors) => ({
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
    color: colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.inputBackground,
    color: colors.text,
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
  switchButton: {
    marginTop: 20,
    alignItems: "center",
  },
  switchText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  switchLink: {
    color: colors.primary,
    fontWeight: "600",
  },
}));
