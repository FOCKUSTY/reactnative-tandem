import type { NavigationProperty } from "../types";

import { useNavigation } from "@react-navigation/native";
import { ScrollView, View, Text } from "react-native";

import { useSections, useFiltersForm } from "../hooks";
import { createStyles } from "../utils";
import { useTheme } from "../contexts";
import {
  SearchInput,
  SectionsSelector,
  TagsInputComponent,
  StatusSwitches,
  SortControls,
  FilterActions,
} from "../components";

export const FiltersScreen = () => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const navigation = useNavigation<NavigationProperty>();
  const { data: sections = [] } = useSections();

  const {
    search,
    setSearch,
    selectedSectionIds,
    setSelectedSectionIds,
    tagsInput,
    setTagsInput,
    isCompleted,
    setIsCompleted,
    isPinned,
    setIsPinned,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    applyFilters,
    clearAll,
  } = useFiltersForm();

  const toggleSection = (id: string) => {
    setSelectedSectionIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id],
    );
  };

  const goBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate("Main");
    }
  };

  const handleApply = () => {
    applyFilters();
    goBack();
  };

  const handleClear = () => {
    clearAll();
    goBack();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Фильтры</Text>

      <View style={styles.field}>
        <Text style={styles.label}>Поиск</Text>
        <SearchInput value={search} onChange={setSearch} />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Секции (можно выбрать несколько)</Text>
        <SectionsSelector
          sections={sections}
          selectedIds={selectedSectionIds}
          onToggle={toggleSection}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Теги (через запятую)</Text>
        <TagsInputComponent
          tags={[]}
          inputValue={tagsInput}
          onInputChange={setTagsInput}
          onAddTag={() => {}}
          onRemoveTag={() => {}}
        />
      </View>

      <View style={styles.field}>
        <StatusSwitches
          isCompleted={isCompleted}
          onCompletedChange={setIsCompleted}
          isPinned={isPinned}
          onPinnedChange={setIsPinned}
        />
      </View>

      <View style={styles.field}>
        <SortControls
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortByChange={setSortBy}
          onSortOrderChange={setSortOrder}
        />
      </View>

      <FilterActions onClear={handleClear} onApply={handleApply} />
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
}));

export default FiltersScreen;
