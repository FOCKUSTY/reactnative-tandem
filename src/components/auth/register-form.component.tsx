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

export type RegisterFormProperties = {
  username: string;
  setUsername: (text: string) => void;
  name: string;
  setName: (text: string) => void;
  email: string;
  setEmail: (text: string) => void;
  password: string;
  setPassword: (text: string) => void;
  confirmPassword: string;
  setConfirmPassword: (text: string) => void;
  remember: RememberOption;
  setRemember: (value: RememberOption) => void;
  loading: boolean;
  errors?: Partial<Record<"username" | "name" | "email" | "password", string>>;
  onSubmit: () => void;
  onSwitchToLogin?: () => void;
};

export const RegisterForm = ({
  username,
  setUsername,
  name,
  setName,
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  remember,
  setRemember,
  loading,
  errors,
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
        style={[styles.input, errors?.name && styles.inputError]}
        placeholder={t("auth.name")}
        placeholderTextColor={colors.textMuted}
        value={name}
        onChangeText={setName}
      />
      {errors?.name && <Text style={styles.errorText}>{errors.name}</Text>}
      <TextInput
        style={[styles.input, errors?.email && styles.inputError]}
        placeholder={t("auth.email")}
        placeholderTextColor={colors.textMuted}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />
      {errors?.email && <Text style={styles.errorText}>{errors.email}</Text>}
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
      <TextInput
        style={styles.input}
        placeholder={t("auth.confirmPassword")}
        placeholderTextColor={colors.textMuted}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

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
        onPress={() => {
          onSubmit();
        }}
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
