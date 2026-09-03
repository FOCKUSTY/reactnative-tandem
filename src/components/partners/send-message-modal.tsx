import { useState } from "react";
import { Text, TextInput, Alert } from "react-native";
import { ModalWrapper } from "../common";
import { useTheme } from "../../contexts";
import { createStyles } from "../../utils";
import { useSendPartnerMessage } from "../../hooks/use-send-partner-message.hook";
import { useTranslate } from "../../hooks";

type Props = {
  visible: boolean;
  onClose: () => void;
};

export const SendMessageModal = ({ visible, onClose }: Props) => {
  const { colors } = useTheme();
  const { t } = useTranslate();
  const styles = getStyles(colors);
  const [message, setMessage] = useState("");
  const { mutate, isPending } = useSendPartnerMessage();

  const handleSend = () => {
    if (!message.trim()) {
      Alert.alert(t("common.error"), t("sendMessage.enterMessage"));
      return;
    }
    mutate(message, {
      onSuccess: () => {
        Alert.alert(t("common.success"), t("sendMessage.success"));
        setMessage("");
        onClose();
      },
      onError: (error: any) => {
        Alert.alert(t("common.error"), error.message);
      },
    });
  };

  return (
    <ModalWrapper
      visible={visible}
      onClose={onClose}
      title={t("sendMessage.title")}
      confirmText={t("common.send")}
      onConfirm={handleSend}
      loading={isPending}
    >
      <Text style={styles.label}>{t("sendMessage.messageLabel")}</Text>
      <TextInput
        style={styles.input}
        multiline
        numberOfLines={4}
        placeholder={t("sendMessage.placeholder")}
        value={message}
        onChangeText={setMessage}
      />
    </ModalWrapper>
  );
};

const getStyles = createStyles((colors) => ({
  label: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.inputBackground,
    color: colors.text,
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: "top",
  },
}));
