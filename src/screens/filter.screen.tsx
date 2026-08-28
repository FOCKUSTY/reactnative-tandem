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
import { useTranslate } from "../hooks";

export const FilterScreen = () => {
  const { t } = useTranslate();
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

  const statusOptions = [
    { value: "all" as const, label: t("filters.status.all") },
    { value: "active" as const, label: t("filters.status.active") },
    { value: "completed" as const, label: t("filters.status.completed") },
  ];

  const pinnedOptions = [
    { value: "all" as const, label: t("filters.pinned.all") },
    { value: "pinned" as const, label: t("filters.pinned.pinned") },
    { value: "unpinned" as const, label: t("filters.pinned.unpinned") },
  ];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.filtersContainer}>
        <FilterSectionChips
          sections={sections}
          selectedIds={filters.sectionIds}
          onToggle={toggleSection}
        />

        <View style={styles.field}>
          <Text style={styles.label}>{t("filters.tagsLabel")}</Text>
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
          title={t("filters.statusTitle")}
          options={statusOptions}
          selected={filters.status}
          onSelect={(value) =>
            setFilters((prev) => ({ ...prev, status: value }))
          }
        />

        <RadioGroup
          title={t("filters.pinnedTitle")}
          options={pinnedOptions}
          selected={filters.pinned}
          onSelect={(value) =>
            setFilters((prev) => ({ ...prev, pinned: value }))
          }
        />

        <TouchableOpacity style={styles.resetButton} onPress={resetFilters}>
          <Text style={styles.resetButtonText}>{t("filters.reset")}</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.resultsContainer}>
        <Text style={styles.resultsCount}>
          {t("filters.resultsCount", { count: filteredRecords.length })}
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
