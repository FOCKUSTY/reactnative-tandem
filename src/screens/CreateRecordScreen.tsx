import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";
import { useTheme } from "../contexts/ThemeContext";
import { ThemeColors } from "../theme/colors";
import { useCreateRecord, useUpdateRecord } from "../hooks/useRecords";
import { useSections, useCreateSection } from "../hooks/useSections";
import { MyRecord, Section } from "../types";
import Icon from "react-native-vector-icons/MaterialIcons";
import DateTimePicker from "@react-native-community/datetimepicker";

type CreateRecordRouteProp = {
  key: string;
  name: "CreateRecord";
  params: { sectionId?: string; record?: MyRecord };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function CreateRecordScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<CreateRecordRouteProp>();
  const { sectionId: initialSectionId, record } = route.params || {};

  const isEditing = !!record;

  const { data: sections = [], isLoading: sectionsLoading } = useSections();
  const createRecord = useCreateRecord();
  const updateRecord = useUpdateRecord();
  const createSection = useCreateSection();

  const [selectedSectionId, setSelectedSectionId] = useState<
    string | undefined
  >(initialSectionId);
  const [title, setTitle] = useState(record?.title || "");
  const [content, setContent] = useState(record?.content || "");
  const [dateEvent, setDateEvent] = useState<Date | null>(
    record?.dateEvent ? new Date(record.dateEvent) : null,
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tags, setTags] = useState<string[]>(record?.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [isCompleted, setIsCompleted] = useState(record?.isCompleted || false);
  const [isPinned, setIsPinned] = useState(record?.isPinned || false);
  const [loading, setLoading] = useState(false);

  const [sectionModalVisible, setSectionModalVisible] = useState(false);
  const [createSectionModalVisible, setCreateSectionModalVisible] =
    useState(false);
  const [newSectionName, setNewSectionName] = useState("");

  useEffect(() => {
    if (initialSectionId && sections.length > 0 && !selectedSectionId) {
      const exists = sections.some((s) => s.id === initialSectionId);
      if (exists) {
        setSelectedSectionId(initialSectionId);
      } else {
        if (sections.length > 0) {
          setSelectedSectionId(sections[0].id);
        }
      }
    }
  }, [sections, initialSectionId]);

  useEffect(() => {
    navigation.setOptions({
      title: isEditing ? "Редактировать запись" : "Создать запись",
    });
  }, [isEditing]);

  const selectedSection = sections.find((s) => s.id === selectedSectionId);

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleDateChange = (selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDateEvent(selectedDate);
    }
  };

  const handleCreateSection = async () => {
    if (!newSectionName.trim()) {
      Alert.alert("Ошибка", "Введите название секции");
      return;
    }
    try {
      const newSection = await createSection.mutateAsync({
        name: newSectionName.trim(),
        slug: undefined,
        isSystem: false,
        order: undefined,
      });
      setSelectedSectionId(newSection.id);
      setNewSectionName("");
      setCreateSectionModalVisible(false);
      setSectionModalVisible(false);
    } catch (error) {
      Alert.alert("Ошибка", "Не удалось создать секцию");
    }
  };

  const handleSubmit = async () => {
    if (!selectedSectionId) {
      Alert.alert("Ошибка", "Выберите секцию");
      return;
    }

    if (!content && !title) {
      Alert.alert("Ошибка", "Введите заголовок или содержание");
      return;
    }

    setLoading(true);
    try {
      const data = {
        sectionId: selectedSectionId,
        title: title.trim() || undefined,
        content: content.trim() || undefined,
        dateEvent: dateEvent ? dateEvent.toISOString() : null,
        isCompleted,
        isPinned,
        tags,
        metadata: {},
      };

      if (isEditing && record) {
        await updateRecord.mutateAsync({
          id: record.id,
          data,
        });
        Alert.alert("Успех", "Запись обновлена");
      } else {
        await createRecord.mutateAsync(data as any);
        Alert.alert("Успех", "Запись создана");
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert("Ошибка", "Не удалось сохранить запись");
    } finally {
      setLoading(false);
    }
  };

  const renderSectionItem = ({ item }: { item: Section }) => (
    <TouchableOpacity
      style={[
        styles.sectionOption,
        item.id === selectedSectionId && styles.sectionOptionSelected,
      ]}
      onPress={() => {
        setSelectedSectionId(item.id);
        setSectionModalVisible(false);
      }}
    >
      <View style={styles.sectionOptionContent}>
        <Text style={styles.sectionOptionName}>{item.name}</Text>
        {item.isSystem && (
          <View style={styles.systemBadge}>
            <Text style={styles.systemBadgeText}>Сист.</Text>
          </View>
        )}
      </View>
      {item.id === selectedSectionId && (
        <Icon name="check" size={20} color={colors.primary} />
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.field}>
        <Text style={styles.label}>Секция *</Text>
        <TouchableOpacity
          style={styles.sectionSelector}
          onPress={() => setSectionModalVisible(true)}
        >
          <Text style={styles.sectionSelectorText}>
            {selectedSection ? selectedSection.name : "Выберите секцию"}
          </Text>
          <Icon name="arrow-drop-down" size={24} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Заголовок</Text>
        <TextInput
          style={styles.input}
          placeholder="Введите заголовок"
          placeholderTextColor={colors.textMuted}
          value={title}
          onChangeText={setTitle}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Содержание *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Введите содержание (поддерживается Markdown)"
          placeholderTextColor={colors.textMuted}
          value={content}
          onChangeText={setContent}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Дата события</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Icon name="event" size={20} color={colors.primary} />
          <Text style={styles.dateButtonText}>
            {dateEvent ? dateEvent.toLocaleDateString() : "Выберите дату"}
          </Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={dateEvent || new Date()}
            mode="date"
            display="default"
            onValueChange={(_, date) => {
              handleDateChange(date);
            }}
            onDismiss={() => {
              handleDateChange();
            }}
          />
        )}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Теги</Text>
        <View style={styles.tagInputContainer}>
          <TextInput
            style={[styles.input, styles.tagInput]}
            placeholder="Введите тег"
            placeholderTextColor={colors.textMuted}
            value={tagInput}
            onChangeText={setTagInput}
            onSubmitEditing={handleAddTag}
          />
          <TouchableOpacity style={styles.addTagButton} onPress={handleAddTag}>
            <Icon name="add" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.tagsContainer}>
          {tags.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
              <TouchableOpacity onPress={() => handleRemoveTag(tag)}>
                <Icon name="close" size={16} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.checkboxRow}>
        <TouchableOpacity
          style={styles.checkboxItem}
          onPress={() => setIsCompleted(!isCompleted)}
        >
          <Icon
            name={isCompleted ? "check-box" : "check-box-outline-blank"}
            size={24}
            color={colors.primary}
          />
          <Text style={styles.checkboxLabel}>Выполнено</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.checkboxItem}
          onPress={() => setIsPinned(!isPinned)}
        >
          <Icon
            name={isPinned ? "check-box" : "check-box-outline-blank"}
            size={24}
            color={colors.primary}
          />
          <Text style={styles.checkboxLabel}>Закреплено</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.saveButton, loading && styles.saveButtonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.saveButtonText}>
          {loading ? "Сохранение..." : isEditing ? "Обновить" : "Создать"}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={sectionModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSectionModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Выберите секцию</Text>
              <TouchableOpacity onPress={() => setSectionModalVisible(false)}>
                <Icon name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {sectionsLoading ? (
              <ActivityIndicator size="large" color={colors.primary} />
            ) : (
              <>
                <FlatList
                  data={sections}
                  keyExtractor={(item) => item.id}
                  renderItem={renderSectionItem}
                  contentContainerStyle={styles.sectionList}
                />
                <TouchableOpacity
                  style={styles.createSectionButton}
                  onPress={() => {
                    setSectionModalVisible(false);
                    setCreateSectionModalVisible(true);
                  }}
                >
                  <Icon name="add" size={20} color={colors.primary} />
                  <Text style={styles.createSectionButtonText}>
                    Создать новую секцию
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      <Modal
        visible={createSectionModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCreateSectionModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Создать секцию</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Название секции"
              placeholderTextColor={colors.textMuted}
              value={newSectionName}
              onChangeText={setNewSectionName}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancel]}
                onPress={() => {
                  setCreateSectionModalVisible(false);
                  setNewSectionName("");
                }}
              >
                <Text style={styles.modalButtonText}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCreate]}
                onPress={handleCreateSection}
              >
                <Text style={[styles.modalButtonText, { color: "#fff" }]}>
                  Создать
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
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
      color: colors.text,
      padding: 12,
      borderRadius: 8,
      fontSize: 16,
    },
    textArea: {
      minHeight: 120,
      textAlignVertical: "top",
    },
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
    dateButton: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.inputBorder,
      backgroundColor: colors.inputBackground,
      padding: 12,
      borderRadius: 8,
    },
    dateButtonText: {
      color: colors.text,
      fontSize: 16,
      marginLeft: 8,
    },
    tagInputContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    tagInput: {
      flex: 1,
      marginRight: 8,
    },
    addTagButton: {
      padding: 8,
    },
    tagsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginTop: 8,
    },
    tag: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.inputBackground,
      borderRadius: 14,
      paddingHorizontal: 10,
      paddingVertical: 4,
      marginRight: 8,
      marginBottom: 6,
    },
    tagText: {
      color: colors.textSecondary,
      fontSize: 14,
      marginRight: 4,
    },
    checkboxRow: {
      flexDirection: "row",
      marginBottom: 20,
    },
    checkboxItem: {
      flexDirection: "row",
      alignItems: "center",
      marginRight: 20,
    },
    checkboxLabel: {
      color: colors.text,
      fontSize: 16,
      marginLeft: 6,
    },
    saveButton: {
      backgroundColor: colors.primary,
      padding: 16,
      borderRadius: 8,
      alignItems: "center",
    },
    saveButtonDisabled: {
      opacity: 0.6,
    },
    saveButtonText: {
      color: "#fff",
      fontWeight: "bold",
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
  });
