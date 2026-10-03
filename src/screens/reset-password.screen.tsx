import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";

import { createStyles } from "../utils";
import { useTheme } from "../contexts";
import { useResetPassword, useTranslate } from "../hooks";
import type { NavigationProperty } from "../types";

type ResetPasswordRouteProps = {
  key: string;
  name: "ResetPassword";
  params: { token?: string };
};

export const ResetPasswordScreen = () => {
  const { t } = useTranslate();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const navigation = useNavigation<NavigationProperty>();
  const route = useRoute<ResetPasswordRouteProps>();
  const token = route.params?.token;

  const {
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    loading,
    done,
    handleSubmit,
  } = useResetPassword(token);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>{t("auth.resetTitle")}</Text>

      {!token && (
        <Text style={styles.errorText}>{t("auth.resetTokenMissing")}</Text>
      )}

      <View style={styles.field}>
        <Text style={styles.label}>{t("auth.resetNewPassword")}</Text>
        <TextInput
          style={styles.input}
          placeholder={t("auth.resetNewPassword")}
          placeholderTextColor={colors.textMuted}
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>{t("auth.resetConfirmPassword")}</Text>
        <TextInput
          style={styles.input}
          placeholder={t("auth.resetConfirmPassword")}
          placeholderTextColor={colors.textMuted}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
      </View>

      <TouchableOpacity
        style={[styles.button, (loading || done) && styles.disabled]}
        onPress={handleSubmit}
        disabled={loading || done}
      >
        <Text style={styles.buttonText}>
          {loading ? t("common.loading") : t("auth.resetSubmit")}
        </Text>
      </TouchableOpacity>

      {done && (
        <TouchableOpacity
          style={styles.backLink}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.backLinkText}>{t("auth.login")}</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const getStyles = createStyles((colors) => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingTop: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 20,
  },
  errorText: {
    color: colors.danger,
    marginBottom: 16,
    fontSize: 14,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.inputBackground,
    color: colors.text,
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  disabled: {
    opacity: 0.6,
  },
  backLink: {
    marginTop: 20,
    alignItems: "center",
  },
  backLinkText: {
    color: colors.primary,
    fontWeight: "600",
    fontSize: 14,
  },
}));

export default ResetPasswordScreen;
