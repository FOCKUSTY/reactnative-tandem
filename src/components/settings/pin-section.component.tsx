import { useState } from "react";
import { View, Text, Switch, Alert, TextInput } from "react-native";
import { usePin } from "../../contexts/pin.context";
import { useTheme } from "../../contexts/theme.context";
import { createStyles } from "../../utils";
import { useTranslate } from "../../hooks";
import { SettingsItem } from "./settings-item.component";
import { ModalWrapper } from "../common";

export const PinSection = () => {
  const { colors } = useTheme();
  const { t } = useTranslate();
  const styles = getStyles(colors);
  const { isPinEnabled, setPin, removePin } = usePin();

  const [modalVisible, setModalVisible] = useState(false);
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  const handleToggle = async (value: boolean) => {
    if (value) {
      setModalVisible(true);
    } else {
      Alert.alert(t("pin.disableTitle"), t("pin.disableMessage"), [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.confirm"),
          style: "destructive",
          onPress: async () => {
            await removePin();
          },
        },
      ]);
    }
  };

  const handleSavePin = async () => {
    if (newPin.length < 4) {
      Alert.alert(t("common.error"), t("pin.errorMinLength"));
      return;
    }
    if (newPin !== confirmPin) {
      Alert.alert(t("common.error"), t("pin.errorMismatch"));
      return;
    }
    await setPin(newPin);
    setModalVisible(false);
    setNewPin("");
    setConfirmPin("");
    Alert.alert(t("common.success"), t("pin.setSuccess"));
  };

  return (
    <>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("pin.title")}</Text>
        <View style={styles.card}>
          <SettingsItem
            icon="lock"
            label={t("pin.enable")}
            rightElement={
              <Switch
                value={isPinEnabled}
                onValueChange={handleToggle}
                trackColor={{ false: colors.inputBorder, true: colors.primary }}
                thumbColor={colors.text}
              />
            }
          />
          {isPinEnabled && (
            <SettingsItem
              icon="edit"
              label={t("pin.change")}
              onPress={() => setModalVisible(true)}
            />
          )}
        </View>
      </View>

      <ModalWrapper
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setNewPin("");
          setConfirmPin("");
        }}
        title={isPinEnabled ? t("pin.changeTitle") : t("pin.setTitle")}
        confirmText={t("common.save")}
        onConfirm={handleSavePin}
      >
        <Text style={styles.modalLabel}>{t("pin.enterNew")}</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          keyboardType="number-pad"
          maxLength={6}
          value={newPin}
          onChangeText={setNewPin}
          placeholder={t("pin.placeholder")}
          placeholderTextColor={colors.textMuted}
        />
        <Text style={styles.modalLabel}>{t("pin.confirmNew")}</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          keyboardType="number-pad"
          maxLength={6}
          value={confirmPin}
          onChangeText={setConfirmPin}
          placeholder={t("pin.placeholder")}
          placeholderTextColor={colors.textMuted}
        />
      </ModalWrapper>
    </>
  );
};

const getStyles = createStyles((colors) => ({
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textMuted,
    textTransform: "uppercase",
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: "hidden",
  },
  modalLabel: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.inputBackground,
    color: colors.text,
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 12,
  },
}));
