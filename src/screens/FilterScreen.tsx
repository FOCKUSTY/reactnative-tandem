import { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../contexts/ThemeContext";
import { ThemeColors } from "../theme/colors";
import { useRecords } from "../hooks/useRecords";
import { useSections } from "../hooks/useSections";
import { MyRecord } from "../types";
import DateTimePicker from "@react-native-community/datetimepicker";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type FilterState = {
  sectionIds: string[];
  tags: string[];
  dateFrom: Date | null;
  dateTo: Date | null;
  status: "all" | "completed" | "active";
  pinned: "all" | "pinned" | "unpinned";
};

export default function FilterScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const navigation = useNavigation<NavigationProp>();

  const { data: allRecords = [] } = useRecords();
  const { data: sections = [] } = useSections();

  const [filters, setFilters] = useState<FilterState>({
    sectionIds: [],
    tags: [],
    dateFrom: null,
    dateTo: null,
    status: "all",
    pinned: "all",
  });

  const [showDateFromPicker, setShowDateFromPicker] = useState(false);
  const [showDateToPicker, setShowDateToPicker] = useState(false);

  const filteredRecords = useMemo(() => {
    let result = [...allRecords];

    if (filters.sectionIds.length > 0) {
      result = result.filter((r) => filters.sectionIds.includes(r.sectionId));
    }

    if (filters.tags.length > 0) {
      result = result.filter((r) =>
        filters.tags.some((tag) => r.tags.includes(tag)),
      );
    }

    if (filters.dateFrom) {
      result = result.filter(
        (r) => r.dateEvent && new Date(r.dateEvent) >= filters.dateFrom!,
      );
    }

    if (filters.dateTo) {
      result = result.filter(
        (r) => r.dateEvent && new Date(r.dateEvent) <= filters.dateTo!,
      );
    }

    if (filters.status === "completed") {
      result = result.filter((r) => r.isCompleted);
    } else if (filters.status === "active") {
      result = result.filter((r) => !r.isCompleted);
    }

    if (filters.pinned === "pinned") {
      result = result.filter((r) => r.isPinned);
    } else if (filters.pinned === "unpinned") {
      result = result.filter((r) => !r.isPinned);
    }

    result.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      if (a.dateEvent && b.dateEvent) {
        return (
          new Date(a.dateEvent).getTime() - new Date(b.dateEvent).getTime()
        );
      }
      return 0;
    });

    return result;
  }, [allRecords, filters]);

  const toggleSection = (sectionId: string) => {
    setFilters((prev) => ({
      ...prev,
      sectionIds: prev.sectionIds.includes(sectionId)
        ? prev.sectionIds.filter((id) => id !== sectionId)
        : [...prev.sectionIds, sectionId],
    }));
  };

  const handleTagChange = (text: string) => {
    const tags = text
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    setFilters((prev) => ({ ...prev, tags }));
  };

  const renderRecord = ({ item }: { item: MyRecord }) => (
    <TouchableOpacity
      style={styles.recordCard}
      onPress={() => navigation.navigate("RecordDetail", { id: item.id })}
      activeOpacity={0.7}
    >
      <Text style={styles.recordTitle}>{item.title || "Без заголовка"}</Text>
      {item.dateEvent && (
        <Text style={styles.recordDate}>
          📅 {new Date(item.dateEvent).toLocaleDateString()}
        </Text>
      )}
      {item.content && (
        <Text style={styles.recordContent} numberOfLines={2}>
          {item.content}
        </Text>
      )}
      <View style={styles.recordTags}>
        {item.tags.slice(0, 3).map((tag) => (
          <View key={tag} style={styles.tagBadge}>
            <Text style={styles.tagText}>#{tag}</Text>
          </View>
        ))}
        {item.tags.length > 3 && (
          <Text style={styles.tagMore}>+{item.tags.length - 3}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.filtersContainer}>
        <Text style={styles.sectionTitle}>Секции</Text>
        <View style={styles.sectionChips}>
          {sections.map((section) => (
            <TouchableOpacity
              key={section.id}
              style={[
                styles.chip,
                filters.sectionIds.includes(section.id) && styles.chipActive,
              ]}
              onPress={() => toggleSection(section.id)}
            >
              <Text
                style={[
                  styles.chipText,
                  filters.sectionIds.includes(section.id) &&
                    styles.chipTextActive,
                ]}
              >
                {section.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Теги (через запятую)</Text>
        <TextInput
          style={styles.input}
          placeholder="например: работа, личное, важное"
          placeholderTextColor={colors.textMuted}
          onChangeText={handleTagChange}
          defaultValue={filters.tags.join(", ")}
        />

        <Text style={styles.sectionTitle}>Дата события</Text>
        <View style={styles.dateRow}>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDateFromPicker(true)}
          >
            <Text style={styles.dateButtonText}>
              {filters.dateFrom ? filters.dateFrom.toLocaleDateString() : "От"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDateToPicker(true)}
          >
            <Text style={styles.dateButtonText}>
              {filters.dateTo ? filters.dateTo.toLocaleDateString() : "До"}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Статус</Text>
        <View style={styles.radioGroup}>
          {(["all", "active", "completed"] as const).map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.radioButton,
                filters.status === status && styles.radioActive,
              ]}
              onPress={() => setFilters((prev) => ({ ...prev, status }))}
            >
              <Text
                style={[
                  styles.radioText,
                  filters.status === status && styles.radioTextActive,
                ]}
              >
                {status === "all"
                  ? "Все"
                  : status === "active"
                    ? "Активные"
                    : "Выполненные"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Закреплено</Text>
        <View style={styles.radioGroup}>
          {(["all", "pinned", "unpinned"] as const).map((pinned) => (
            <TouchableOpacity
              key={pinned}
              style={[
                styles.radioButton,
                filters.pinned === pinned && styles.radioActive,
              ]}
              onPress={() => setFilters((prev) => ({ ...prev, pinned }))}
            >
              <Text
                style={[
                  styles.radioText,
                  filters.pinned === pinned && styles.radioTextActive,
                ]}
              >
                {pinned === "all"
                  ? "Все"
                  : pinned === "pinned"
                    ? "Закреплённые"
                    : "Не закреплённые"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.resetButton}
          onPress={() =>
            setFilters({
              sectionIds: [],
              tags: [],
              dateFrom: null,
              dateTo: null,
              status: "all",
              pinned: "all",
            })
          }
        >
          <Text style={styles.resetButtonText}>Сбросить фильтры</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.resultsContainer}>
        <Text style={styles.resultsCount}>
          Найдено: {filteredRecords.length}
        </Text>
        <FlatList
          data={filteredRecords}
          keyExtractor={(item) => item.id}
          renderItem={renderRecord}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {showDateFromPicker && (
        <DateTimePicker
          value={filters.dateFrom || new Date()}
          mode="date"
          display="default"
          onValueChange={(_, date) => {
            setShowDateFromPicker(false);
            if (date) setFilters((prev) => ({ ...prev, dateFrom: date }));
          }}
          onDismiss={() => setShowDateFromPicker(false)}
        />
      )}

      {showDateToPicker && (
        <DateTimePicker
          value={filters.dateTo || new Date()}
          mode="date"
          display="default"
          onValueChange={(_, date) => {
            setShowDateToPicker(false);
            if (date) setFilters((prev) => ({ ...prev, dateTo: date }));
          }}
          onDismiss={() => setShowDateToPicker(false)}
        />
      )}
    </View>
  );
}

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    filtersContainer: {
      paddingInline: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.cardBorder,
      maxHeight: "40%",
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
      marginTop: 12,
      marginBottom: 8,
    },
    sectionChips: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    chip: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      backgroundColor: colors.inputBackground,
      borderWidth: 1,
      borderColor: colors.inputBorder,
    },
    chipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    chipText: {
      color: colors.textSecondary,
      fontSize: 14,
    },
    chipTextActive: {
      color: "#fff",
    },
    input: {
      borderWidth: 1,
      borderColor: colors.inputBorder,
      backgroundColor: colors.inputBackground,
      color: colors.text,
      padding: 10,
      borderRadius: 8,
      fontSize: 14,
    },
    dateRow: {
      flexDirection: "row",
      gap: 8,
    },
    dateButton: {
      flex: 1,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      backgroundColor: colors.inputBackground,
      padding: 10,
      borderRadius: 8,
      alignItems: "center",
    },
    dateButtonText: {
      color: colors.text,
      fontSize: 14,
    },
    radioGroup: {
      flexDirection: "row",
      gap: 8,
      flexWrap: "wrap",
    },
    radioButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      backgroundColor: colors.inputBackground,
      borderWidth: 1,
      borderColor: colors.inputBorder,
    },
    radioActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    radioText: {
      color: colors.textSecondary,
      fontSize: 14,
    },
    radioTextActive: {
      color: "#fff",
    },
    resetButton: {
      marginTop: 16,
      padding: 12,
      borderRadius: 8,
      backgroundColor: colors.danger + "20",
      alignItems: "center",
    },
    resetButtonText: {
      color: colors.danger,
      fontWeight: "600",
    },
    resultsContainer: {
      flex: 1,
      paddingHorizontal: 16,
    },
    resultsCount: {
      fontSize: 14,
      color: colors.textMuted,
      marginVertical: 8,
    },
    listContent: {
      paddingBottom: 16,
    },
    recordCard: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    recordTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 4,
    },
    recordDate: {
      fontSize: 14,
      color: colors.primary,
      marginBottom: 2,
    },
    recordContent: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 4,
    },
    recordTags: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginTop: 4,
    },
    tagBadge: {
      backgroundColor: colors.inputBackground,
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 2,
      marginRight: 4,
    },
    tagText: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    tagMore: {
      fontSize: 12,
      color: colors.textMuted,
      alignSelf: "center",
      marginLeft: 4,
    },
  });
