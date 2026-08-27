import type { Section } from "../../types";

import { MaterialIcons } from "@react-native-vector-icons/material-icons";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";

import { createStyles } from "../../utils";
import { useTheme } from "../../contexts";
import { ModalWrapper } from "../common";
import { CreateSectionModal } from "./create-section-modal.component";

export type SectionSelectorProperties = {
  sections: Section[];
  loading: boolean;
  selectedId?: string;
  onSelect: (id: string) => void;
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  createModalVisible: boolean;
  setCreateModalVisible: (visible: boolean) => void;
  newSectionName: string;
  setNewSectionName: (name: string) => void;
  onCreateSection: () => void;
};

export const SectionSelectorComponent = ({
  sections,
  loading,
  selectedId,
  onSelect,
  modalVisible,
  setModalVisible,
  createModalVisible,
  setCreateModalVisible,
  newSectionName,
  setNewSectionName,
  onCreateSection,
}: SectionSelectorProperties) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const selectedSection = sections.find((s) => s.id === selectedId);

  const renderSectionItem = ({ item }: { item: Section }) => (
    <TouchableOpacity
      style={[styles.option, item.id === selectedId && styles.optionSelected]}
      onPress={() => {
        onSelect(item.id);
        setModalVisible(false);
      }}
    >
      <View style={styles.optionContent}>
        <Text style={styles.optionName}>{item.name}</Text>
        {item.isSystem && (
          <View style={styles.systemBadge}>
            <Text style={styles.systemBadgeText}>Сист.</Text>
          </View>
        )}
      </View>
      {item.id === selectedId && (
        <MaterialIcons name="check" size={20} color={colors.primary} />
      )}
    </TouchableOpacity>
  );

  return (
    <>
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.selectorText}>
          {selectedSection ? selectedSection.name : "Выберите секцию"}
        </Text>
        <MaterialIcons
          name="arrow-drop-down"
          size={24}
          color={colors.textMuted}
        />
      </TouchableOpacity>

      <ModalWrapper
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="Выберите секцию"
        showCancel={false}
      >
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : (
          <>
            <FlatList
              data={sections}
              keyExtractor={(item) => item.id}
              renderItem={renderSectionItem}
              contentContainerStyle={styles.list}
            />
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => {
                setModalVisible(false);
                setCreateModalVisible(true);
              }}
            >
              <MaterialIcons name="add" size={20} color={colors.primary} />
              <Text style={styles.createButtonText}>Создать новую секцию</Text>
            </TouchableOpacity>
          </>
        )}
      </ModalWrapper>

      <CreateSectionModal
        visible={createModalVisible}
        onClose={() => {
          setCreateModalVisible(false);
          setNewSectionName("");
        }}
        sectionName={newSectionName}
        setSectionName={setNewSectionName}
        onCreate={onCreateSection}
      />
    </>
  );
};

const getStyles = createStyles((colors) => ({
  sectionSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.inputBackground,
    padding: 12,
    borderRadius: 8,
  },
  sectionSelectorText: {
    color: colors.text,
    fontSize: 16,
  },
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
    width: "90%",
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
  },
  sectionList: {
    paddingBottom: 8,
  },
  sectionOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  sectionOptionSelected: {
    backgroundColor: colors.inputBackground,
    borderRadius: 4,
  },
  sectionOptionContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionOptionName: {
    fontSize: 16,
    color: colors.text,
  },
  systemBadge: {
    backgroundColor: colors.inputBackground,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  systemBadgeText: {
    fontSize: 10,
    color: colors.textMuted,
  },
  createSectionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  createSectionButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.inputBackground,
    color: colors.text,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
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
