import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useTheme } from "../../contexts";
import { createStyles } from "../../utils";
import { useTranslate } from "../../hooks";
import {
  REMEMBER_LABEL_KEYS,
  REMEMBER_OPTIONS,
  type RememberOption,
} from "../../constants";
import { RadioGroup } from "../common";

export type LoginFormProperties = {
  username: string;
  setUsername: (text: string) => void;
  password: string;
  setPassword: (text: string) => void;
  remember: RememberOption;
  setRemember: (value: RememberOption) => void;
  errors?: Partial<Record<"username" | "password", string>>;
  loading: boolean;
  onSubmit: () => void;
  onSwitchToRegister?: () => void;
  onForgotPassword?: () => void;
};

export const LoginForm = ({
  username,
  setUsername,
  password,
  setPassword,
  remember,
  setRemember,
  loading,
  onSubmit,
  onSwitchToRegister,
  onForgotPassword,
  errors,
}: LoginFormProperties) => {
  const { colors } = useTheme();
  const { t } = useTranslate();
  const styles = getStyles(colors);

  return (
    <View>
      <Text style={styles.title}>{t("auth.welcome")}</Text>
      <TextInput
        style={[styles.input, errors?.username && styles.inputError]}
        placeholder={t("auth.username")}
        placeholderTextColor={colors.textMuted}
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      {errors?.username && (
        <Text style={styles.errorText}>{errors.username}</Text>
      )}

      <TextInput
        style={[styles.input, errors?.password && styles.inputError]}
        placeholder={t("auth.password")}
        placeholderTextColor={colors.textMuted}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {errors?.password && (
        <Text style={styles.errorText}>{errors.password}</Text>
      )}

      <RadioGroup
        title={t("auth.remember.title")}
        options={REMEMBER_OPTIONS.map((value) => ({
          value,
          label: t(REMEMBER_LABEL_KEYS[value]),
        }))}
        selected={remember}
        onSelect={setRemember}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={onSubmit}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? t("auth.loginLoading") : t("auth.login")}
        </Text>
      </TouchableOpacity>

      {onForgotPassword && (
        <TouchableOpacity
          style={styles.switchButton}
          onPress={onForgotPassword}
        >
          <Text style={styles.switchLink}>{t("auth.forgotPassword")}</Text>
        </TouchableOpacity>
      )}

      {onSwitchToRegister && (
        <TouchableOpacity
          style={styles.switchButton}
          onPress={onSwitchToRegister}
        >
          <Text style={styles.switchText}>
            {t("auth.noAccount")}{" "}
            <Text style={styles.switchLink}>{t("auth.register")}</Text>
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const getStyles = createStyles((colors) => ({
  inputError: {
    borderColor: colors.danger,
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    marginTop: -10,
    marginBottom: 10,
    marginLeft: 4,
  },
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
