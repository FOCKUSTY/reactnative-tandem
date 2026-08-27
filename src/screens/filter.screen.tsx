import {
  View,
  Text,
  FlatList,
  ScrollView,
  TouchableOpacity,
} from "react-native";

import { createStyles } from "../utils";
import { useTheme } from "../contexts";
import { useFilter } from "../hooks";
import {
  FilterSectionChips,
  TagsInputFilter,
  DateRangePicker,
  RadioGroup,
  RecordCard,
} from "../components";

const statusOptions = [
  { value: "all" as const, label: "Все" },
  { value: "active" as const, label: "Активные" },
  { value: "completed" as const, label: "Выполненные" },
];

const pinnedOptions = [
  { value: "all" as const, label: "Все" },
  { value: "pinned" as const, label: "Закреплённые" },
  { value: "unpinned" as const, label: "Не закреплённые" },
];

export const FilterScreen = () => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const {
    sections,
    filters,
    setFilters,
    filteredRecords,
    toggleSection,
    handleTagChange,
    resetFilters,
  } = useFilter();

  return (
    <View style={styles.container}>
      <ScrollView style={styles.filtersContainer}>
        <FilterSectionChips
          sections={sections}
          selectedIds={filters.sectionIds}
          onToggle={toggleSection}
        />

        <View style={styles.field}>
          <Text style={styles.label}>Теги (через запятую)</Text>
          <TagsInputFilter
            value={filters.tags.join(", ")}
            onChange={handleTagChange}
          />
        </View>

        <DateRangePicker
          dateFrom={filters.dateFrom}
          dateTo={filters.dateTo}
          onDateFromChange={(date) =>
            setFilters((prev) => ({ ...prev, dateFrom: date }))
          }
          onDateToChange={(date) =>
            setFilters((prev) => ({ ...prev, dateTo: date }))
          }
        />

        <RadioGroup
          title="Статус"
          options={statusOptions}
          selected={filters.status}
          onSelect={(value) =>
            setFilters((prev) => ({ ...prev, status: value }))
          }
        />

        <RadioGroup
          title="Закреплено"
          options={pinnedOptions}
          selected={filters.pinned}
          onSelect={(value) =>
            setFilters((prev) => ({ ...prev, pinned: value }))
          }
        />

        <TouchableOpacity style={styles.resetButton} onPress={resetFilters}>
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
          renderItem={({ item }) => <RecordCard record={item} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
};

const getStyles = createStyles((colors) => ({
  filtersContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    maxHeight: "40%",
  },
  resetButton: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.danger + "20",
    alignItems: "center",
  },
  resetButtonText: { color: colors.danger, fontWeight: "600" },
  resultsContainer: { flex: 1, paddingHorizontal: 16 },
  resultsCount: { fontSize: 14, color: colors.textMuted, marginVertical: 8 },
  listContent: { paddingBottom: 16 },
}));
