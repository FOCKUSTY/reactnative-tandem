import { TextInput } from "react-native";
import { ModalWrapper } from "../common";
import { useTheme } from "../../contexts";
import { createStyles } from "../../utils";
import { useTranslate } from "../../hooks";

export type CreateSectionModalProps = {
  visible: boolean;
  onClose: () => void;
  sectionName: string;
  setSectionName: (name: string) => void;
  onCreate: () => void;
  loading?: boolean;
};

export const CreateSectionModal = ({
  visible,
  onClose,
  sectionName,
  setSectionName,
  onCreate,
  loading = false,
}: CreateSectionModalProps) => {
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
        value={sectionName}
        onChangeText={setSectionName}
        autoFocus
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
