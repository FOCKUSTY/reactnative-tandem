import type { Table } from "../types/table.types";

import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useState } from "react";
import { MaterialIcons } from "@react-native-vector-icons/material-icons";

import { ModalWrapper } from "../components";
import {
  useTableSections,
  useCreateTableSection,
  useCreateTable,
  useUpdateTable,
  useTranslate,
} from "../hooks";
import { createStyles } from "../utils";
import { useTheme } from "../contexts";

export type CreateTableRouteProperties = {
  key: string;
  name: "CreateTable";
  params?: { sectionId?: string; table?: Table };
};

export const CreateTableScreen = () => {
  const { t } = useTranslate();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const navigation = useNavigation();
  const route = useRoute<CreateTableRouteProperties>();
  const { sectionId: initialSectionId, table } = route.params || {};
  const isEditing = !!table;

  const { data: sections = [], isLoading: sectionsLoading } =
    useTableSections();
  const createSection = useCreateTableSection();
  const createTable = useCreateTable();
  const updateTable = useUpdateTable();

  const [selectedSectionId, setSelectedSectionId] = useState<
    string | undefined
  >(initialSectionId || table?.sectionId);
  const [name, setName] = useState(table?.name || "");
  const [description, setDescription] = useState(table?.description || "");
  const [sectionModal, setSectionModal] = useState(false);
  const [createSectionModal, setCreateSectionModal] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");

  const selectedSection = sections.find((s) => s.id === selectedSectionId);

  const handleCreateSection = async () => {
    if (!newSectionName.trim()) return;
    try {
      const res = await createSection.mutateAsync({
        name: newSectionName.trim(),
      });
      setSelectedSectionId(res.id);
      setNewSectionName("");
      setCreateSectionModal(false);
      setSectionModal(false);
    } catch {
      Alert.alert(t("common.error"), t("sections.errors.createFailed"));
    }
  };

  const handleSubmit = async () => {
    if (!selectedSectionId) {
      Alert.alert(t("common.error"), t("tables.errors.sectionRequired"));
      return;
    }
    if (!name.trim()) {
      Alert.alert(t("common.error"), t("tables.errors.nameRequired"));
      return;
    }

    try {
      if (isEditing && table) {
        await updateTable.mutateAsync({
          id: table.id,
          data: {
            name: name.trim(),
            description: description.trim() || undefined,
            sectionId: selectedSectionId,
          },
        });
        Alert.alert(t("common.success"), t("tables.updateSuccess"));
      } else {
        await createTable.mutateAsync({
          sectionId: selectedSectionId,
          name: name.trim(),
          description: description.trim() || undefined,
        });
        Alert.alert(t("common.success"), t("tables.createSuccess"));
      }
      navigation.goBack();
    } catch {
      Alert.alert(
        t("common.error"),
        isEditing
          ? t("tables.errors.updateFailed")
          : t("tables.errors.createFailed"),
      );
    }
  };

  const isPending = createTable.isPending || updateTable.isPending;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.field}>
        <Text style={styles.label}>{t("tables.section")} *</Text>
        <TouchableOpacity
          style={styles.selector}
          onPress={() => setSectionModal(true)}
        >
          <Text style={styles.selectorText}>
            {selectedSection?.name || t("tables.selectSection")}
          </Text>
          <MaterialIcons
            name="arrow-drop-down"
            size={24}
            color={colors.textMuted}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>{t("tables.name")} *</Text>
        <TextInput
          style={styles.input}
          placeholder={t("tables.namePlaceholder")}
          placeholderTextColor={colors.textMuted}
          value={name}
          onChangeText={setName}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>{t("tables.description")}</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder={t("tables.descriptionPlaceholder")}
          placeholderTextColor={colors.textMuted}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
        />
      </View>

      <TouchableOpacity
        style={[styles.saveButton, isPending && styles.disabled]}
        onPress={handleSubmit}
        disabled={isPending}
      >
        {isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>
            {isEditing ? t("common.save") : t("common.create")}
          </Text>
        )}
      </TouchableOpacity>

      <ModalWrapper
        visible={sectionModal}
        onClose={() => setSectionModal(false)}
        title={t("tables.selectSection")}
        showCancel={false}
      >
        {sectionsLoading ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <>
            <FlatList
              data={sections}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.option,
                    item.id === selectedSectionId && styles.optionActive,
                  ]}
                  onPress={() => {
                    setSelectedSectionId(item.id);
                    setSectionModal(false);
                  }}
                >
                  <Text style={styles.optionText}>{item.name}</Text>
                  {item.id === selectedSectionId && (
                    <MaterialIcons
                      name="check"
                      size={20}
                      color={colors.primary}
                    />
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyList}>{t("sections.empty")}</Text>
              }
            />
            <TouchableOpacity
              style={styles.createSectionButton}
              onPress={() => {
                setSectionModal(false);
                setCreateSectionModal(true);
              }}
            >
              <MaterialIcons name="add" size={20} color={colors.primary} />
              <Text style={styles.createSectionButtonText}>
                {t("tables.createSection")}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ModalWrapper>

      <ModalWrapper
        visible={createSectionModal}
        onClose={() => setCreateSectionModal(false)}
        title={t("tables.createSection")}
        confirmText={t("common.create")}
        onConfirm={handleCreateSection}
        loading={createSection.isPending}
      >
        <TextInput
          style={styles.input}
          placeholder={t("tables.sectionName")}
          placeholderTextColor={colors.textMuted}
          value={newSectionName}
          onChangeText={setNewSectionName}
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
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.inputBackground,
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    color: colors.text,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  selector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.inputBackground,
    padding: 12,
    borderRadius: 8,
  },
  selectorText: {
    color: colors.text,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  disabled: {
    opacity: 0.6,
  },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  optionActive: {
    backgroundColor: colors.inputBackground,
    borderRadius: 4,
  },
  optionText: {
    fontSize: 16,
    color: colors.text,
  },
  emptyList: {
    color: colors.textMuted,
    textAlign: "center",
    padding: 12,
  },
  createSectionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    gap: 8,
  },
  createSectionButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "600",
  },
}));

export default CreateTableScreen;
