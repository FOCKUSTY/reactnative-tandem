import { useState } from "react";
import { Text, TextInput, Alert } from "react-native";
import { ModalWrapper } from "../common";
import { useTheme } from "../../contexts";
import { createStyles } from "../../utils";
import { useSendPartnerMessage } from "../../hooks/use-send-partner-message.hook";

type Props = {
  visible: boolean;
  onClose: () => void;
};

export const SendMessageModal = ({ visible, onClose }: Props) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [message, setMessage] = useState("");
  const { mutate, isPending } = useSendPartnerMessage();

  const handleSend = () => {
    if (!message.trim()) {
      Alert.alert("Ошибка", "Введите сообщение");
      return;
    }
    mutate(message, {
      onSuccess: () => {
        Alert.alert("Успешно", "Уведомление отправлено");
        setMessage("");
        onClose();
      },
      onError: (error: any) => {
        Alert.alert("Ошибка", error.message);
      },
    });
  };

  return (
    <ModalWrapper
      visible={visible}
      onClose={onClose}
      title="Отправить партнёру"
      confirmText="Отправить"
      onConfirm={handleSend}
      loading={isPending}
    >
      <Text style={styles.label}>Сообщение:</Text>
      <TextInput
        style={styles.input}
        multiline
        numberOfLines={4}
        placeholder="Напишите что-то приятное..."
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
