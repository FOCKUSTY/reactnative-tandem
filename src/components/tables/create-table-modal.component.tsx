import { TextInput } from "react-native";
import { ModalWrapper } from "../common";
import { useTheme } from "../../contexts";
import { createStyles } from "../../utils";
import { useTranslate } from "../../hooks";

type CreateTableModalProps = {
  visible: boolean;
  onClose: () => void;
  name: string;
  setName: (name: string) => void;
  description: string;
  setDescription: (description: string) => void;
  onCreate: () => void;
  loading?: boolean;
};

export const CreateTableModal = ({
  visible,
  onClose,
  name,
  setName,
  description,
  setDescription,
  onCreate,
  loading = false,
}: CreateTableModalProps) => {
  const { colors } = useTheme();
  const { t } = useTranslate();
  const styles = getStyles(colors);

  return (
    <ModalWrapper
      visible={visible}
      onClose={onClose}
      title={t("sections.create")}
      confirmText={t("common.create")}
      onConfirm={onCreate}
      loading={loading}
    >
      <TextInput
        style={styles.input}
        placeholder={t("sections.name")}
        placeholderTextColor={colors.textMuted}
        value={name}
        onChangeText={setName}
        autoFocus
      />
      <TextInput
        style={[styles.input, { marginTop: 12 }]}
        placeholder="Описание (необязательно)"
        placeholderTextColor={colors.textMuted}
        value={description}
        onChangeText={setDescription}
      />
    </ModalWrapper>
  );
};

const getStyles = createStyles((colors) => ({
  input: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.inputBackground,
    color: colors.text,
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
}));
