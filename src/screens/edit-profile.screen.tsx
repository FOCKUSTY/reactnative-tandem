import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { createStyles } from "../utils";
import { useTheme } from "../contexts";
import { useEditProfile, useTranslate } from "../hooks";
import { ModalWrapper } from "../components";

export const EditProfileScreen = () => {
  const { colors } = useTheme();
  const { t } = useTranslate();
  const styles = getStyles(colors);
  const {
    name,
    setName,
    username,
    setUsername,
    email,
    setEmail,
    loading,
    handleSaveProfile,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    passwordLoading,
    handleChangePassword,
    deleteModalVisible,
    setDeleteModalVisible,
    deletePassword,
    setDeletePassword,
    deleteLoading,
    handleDeleteAccount,
  } = useEditProfile();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>{t("profile.profileSection")}</Text>
      <View style={styles.card}>
        <View style={styles.field}>
          <Text style={styles.label}>{t("auth.name")}</Text>
          <TextInput
            style={styles.input}
            placeholder={t("auth.name")}
            placeholderTextColor={colors.textMuted}
            value={name}
            onChangeText={setName}
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>{t("auth.username")}</Text>
          <TextInput
            style={styles.input}
            placeholder={t("auth.username")}
            placeholderTextColor={colors.textMuted}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>{t("auth.email")}</Text>
          <TextInput
            style={styles.input}
            placeholder={t("auth.email")}
            placeholderTextColor={colors.textMuted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.buttonDisabled]}
          onPress={handleSaveProfile}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? t("common.saving") : t("common.save")}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.sectionTitle, styles.mt24]}>
        {t("profile.passwordSection")}
      </Text>
      <View style={styles.card}>
        <View style={styles.field}>
          <Text style={styles.label}>{t("profile.currentPassword")}</Text>
          <TextInput
            style={styles.input}
            placeholder={t("profile.currentPassword")}
            placeholderTextColor={colors.textMuted}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>{t("profile.newPassword")}</Text>
          <TextInput
            style={styles.input}
            placeholder={t("profile.newPassword")}
            placeholderTextColor={colors.textMuted}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>{t("auth.confirmPassword")}</Text>
          <TextInput
            style={styles.input}
            placeholder={t("auth.confirmPassword")}
            placeholderTextColor={colors.textMuted}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
        </View>
        <TouchableOpacity
          style={[styles.saveButton, passwordLoading && styles.buttonDisabled]}
          onPress={handleChangePassword}
          disabled={passwordLoading}
        >
          <Text style={styles.saveButtonText}>
            {passwordLoading ? t("common.saving") : t("profile.changePassword")}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.sectionTitle, styles.mt24, styles.dangerTitle]}>
        {t("settings.dangerZone")}
      </Text>
      <View style={[styles.card, styles.dangerCard]}>
        <Text style={styles.dangerHint}>
          {t("settings.deleteAccountMessage")}
        </Text>
        <TouchableOpacity
          style={[styles.saveButton, styles.dangerButton]}
          onPress={() => {
            Alert.alert(
              t("settings.deleteAccountTitle"),
              t("settings.deleteAccountMessage"),
              [
                { text: t("common.cancel"), style: "cancel" },
                {
                  text: t("settings.deleteAccountConfirm"),
                  style: "destructive",
                  onPress: () => setDeleteModalVisible(true),
                },
              ],
            );
          }}
        >
          <Text style={styles.saveButtonText}>
            {t("settings.deleteAccount")}
          </Text>
        </TouchableOpacity>
      </View>

      <ModalWrapper
        visible={deleteModalVisible}
        onClose={() => {
          setDeleteModalVisible(false);
          setDeletePassword("");
        }}
        title={t("settings.deleteAccountTitle")}
        confirmText={t("settings.deleteAccountConfirm")}
        onConfirm={handleDeleteAccount}
        loading={deleteLoading}
      >
        <Text style={styles.label}>
          {t("settings.deleteAccountPasswordPlaceholder")}
        </Text>
        <TextInput
          style={styles.input}
          placeholder={t("auth.password")}
          placeholderTextColor={colors.textMuted}
          value={deletePassword}
          onChangeText={setDeletePassword}
          secureTextEntry
          autoFocus
        />
      </ModalWrapper>
    </ScrollView>
  );
};

const getStyles = createStyles((colors) => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textMuted,
    textTransform: "uppercase",
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  mt24: {
    marginTop: 24,
  },
  dangerTitle: {
    color: colors.danger,
  },
  dangerCard: {
    borderColor: colors.danger,
  },
  dangerHint: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
    marginBottom: 14,
  },
  dangerButton: {
    backgroundColor: colors.danger,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
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
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
}));

export default EditProfileScreen;
