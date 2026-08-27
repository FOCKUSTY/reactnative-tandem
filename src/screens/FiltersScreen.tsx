import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../contexts/ThemeContext";
import { ThemeColors } from "../theme/colors";
import { useFilters } from "../contexts/FiltersContext";
import { useSections } from "../hooks/useSections";
import Icon from "react-native-vector-icons/MaterialIcons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function FiltersScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const navigation = useNavigation<NavigationProp>();
  const { filters, setFilters, clearFilters } = useFilters();
  const { data: sections = [] } = useSections();

  const [search, setSearch] = useState(filters.search || "");
  const [selectedSectionIds, setSelectedSectionIds] = useState<string[]>(
    filters.sectionIds || [],
  );
  const [tagsInput, setTagsInput] = useState(filters.tags?.join(", ") || "");
  const [isCompleted, setIsCompleted] = useState<boolean | undefined>(
    filters.isCompleted,
  );
  const [isPinned, setIsPinned] = useState<boolean | undefined>(
    filters.isPinned,
  );
  const [sortBy, setSortBy] = useState<
    "dateEvent" | "createdAt" | "updatedAt" | "title"
  >(filters.sortBy || "dateEvent");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(
    filters.sortOrder || "asc",
  );

  const toggleSection = (sectionId: string) => {
    setSelectedSectionIds((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId],
    );
  };

  const goBack = () => {
    if (navigation.canGoBack()) {
      return navigation.goBack();
    } else {
      return navigation.navigate("Main");
    }
  };

  const handleApply = () => {
    const newFilters: any = {
      search: search.trim() || undefined,
      sectionIds:
        selectedSectionIds.length > 0 ? selectedSectionIds : undefined,
      tags: tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      isCompleted,
      isPinned,
      sortBy,
      sortOrder,
    };
    Object.keys(newFilters).forEach((key) => {
      if (newFilters[key] === undefined || newFilters[key] === null) {
        delete newFilters[key];
      }
    });
    setFilters(newFilters);
    goBack();
  };

  const handleClear = () => {
    clearFilters();
    setSearch("");
    setSelectedSectionIds([]);
    setTagsInput("");
    setIsCompleted(undefined);
    setIsPinned(undefined);
    setSortBy("dateEvent");
    setSortOrder("asc");
    goBack();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Фильтры</Text>

      <View style={styles.field}>
        <Text style={styles.label}>Поиск</Text>
        <TextInput
          style={styles.input}
          placeholder="Поиск по тексту"
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Секции (можно выбрать несколько)</Text>
        {sections.map((section) => (
          <TouchableOpacity
            key={section.id}
            style={styles.sectionItem}
            onPress={() => toggleSection(section.id)}
          >
            <Icon
              name={
                selectedSectionIds.includes(section.id)
                  ? "check-box"
                  : "check-box-outline-blank"
              }
              size={24}
              color={colors.primary}
            />
            <Text style={styles.sectionName}>{section.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Теги (через запятую)</Text>
        <TextInput
          style={styles.input}
          placeholder="тег1, тег2, тег3"
          placeholderTextColor={colors.textMuted}
          value={tagsInput}
          onChangeText={setTagsInput}
        />
      </View>

      <View style={styles.field}>
        <View style={styles.switchRow}>
          <Text style={styles.label}>Только завершённые</Text>
          <Switch
            value={isCompleted === true}
            onValueChange={(val) => setIsCompleted(val ? true : undefined)}
            trackColor={{ false: colors.inputBorder, true: colors.primary }}
            thumbColor={colors.text}
          />
        </View>
        <View style={styles.switchRow}>
          <Text style={styles.label}>Только не завершённые</Text>
          <Switch
            value={isCompleted === false}
            onValueChange={(val) => setIsCompleted(val ? false : undefined)}
            trackColor={{ false: colors.inputBorder, true: colors.primary }}
            thumbColor={colors.text}
          />
        </View>
      </View>

      <View style={styles.field}>
        <View style={styles.switchRow}>
          <Text style={styles.label}>Только закреплённые</Text>
          <Switch
            value={isPinned === true}
            onValueChange={(val) => setIsPinned(val ? true : undefined)}
            trackColor={{ false: colors.inputBorder, true: colors.primary }}
            thumbColor={colors.text}
          />
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Сортировка</Text>
        <View style={styles.sortRow}>
          <TouchableOpacity
            style={[
              styles.sortButton,
              sortBy === "dateEvent" && styles.sortButtonActive,
            ]}
            onPress={() => setSortBy("dateEvent")}
          >
            <Text style={styles.sortButtonText}>Дата</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.sortButton,
              sortBy === "createdAt" && styles.sortButtonActive,
            ]}
            onPress={() => setSortBy("createdAt")}
          >
            <Text style={styles.sortButtonText}>Создано</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.sortButton,
              sortBy === "title" && styles.sortButtonActive,
            ]}
            onPress={() => setSortBy("title")}
          >
            <Text style={styles.sortButtonText}>Заголовок</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.sortRow}>
          <TouchableOpacity
            style={[
              styles.sortButton,
              sortOrder === "asc" && styles.sortButtonActive,
            ]}
            onPress={() => setSortOrder("asc")}
          >
            <Text style={styles.sortButtonText}>По возрастанию</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.sortButton,
              sortOrder === "desc" && styles.sortButtonActive,
            ]}
            onPress={() => setSortOrder("desc")}
          >
            <Text style={styles.sortButtonText}>По убыванию</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.clearButton]}
          onPress={handleClear}
        >
          <Text style={styles.buttonText}>Сбросить</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.applyButton]}
          onPress={handleApply}
        >
          <Text style={styles.buttonText}>Применить</Text>
        </TouchableOpacity>
      </View>
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
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 20,
    },
    field: {
      marginBottom: 20,
    },
    label: {
      fontSize: 16,
      fontWeight: "600",
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
    },
    sectionItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 8,
      gap: 8,
    },
    sectionName: {
      fontSize: 16,
      color: colors.text,
    },
    switchRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    sortRow: {
      flexDirection: "row",
      gap: 8,
      marginBottom: 8,
    },
    sortButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      backgroundColor: colors.inputBackground,
      borderWidth: 1,
      borderColor: colors.inputBorder,
    },
    sortButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    sortButtonText: {
      color: colors.text,
      fontSize: 14,
    },
    actions: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 20,
      gap: 12,
    },
    button: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: "center",
    },
    clearButton: {
      backgroundColor: colors.inputBackground,
      borderWidth: 1,
      borderColor: colors.inputBorder,
    },
    applyButton: {
      backgroundColor: colors.primary,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
    },
  });
