import { Modal, View, Text, TextInput, TouchableOpacity } from "react-native";
import { useTheme } from "../../contexts";
import { createStyles } from "../../utils";

export type CreateSectionModalProps = {
  visible: boolean;
  onClose: () => void;
  sectionName: string;
  setSectionName: (name: string) => void;
  onCreate: () => void;
};

export const CreateSectionModal = ({
  visible,
  onClose,
  sectionName,
  setSectionName,
  onCreate,
}: CreateSectionModalProps) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Создать секцию</Text>
          <TextInput
            style={styles.modalInput}
            placeholder="Название секции"
            placeholderTextColor={colors.textMuted}
            value={sectionName}
            onChangeText={setSectionName}
            autoFocus
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalCancel]}
              onPress={onClose}
            >
              <Text style={styles.modalButtonText}>Отмена</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalCreate]}
              onPress={onCreate}
            >
              <Text style={[styles.modalButtonText, { color: "#fff" }]}>
                Создать
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const getStyles = createStyles((colors) => ({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 24,
    width: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 16,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.inputBackground,
    color: colors.text,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalCancel: {
    backgroundColor: colors.inputBackground,
  },
  modalCreate: {
    backgroundColor: colors.primary,
  },
  modalButtonText: {
    fontSize: 16,
    color: colors.text,
  },
}));
