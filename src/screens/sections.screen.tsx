import type { NavigationProperty } from "../types";

import { MaterialIcons } from "@react-native-vector-icons/material-icons";
import { useNavigation } from "@react-navigation/native";
import { View, TouchableOpacity } from "react-native";
import { useLayoutEffect } from "react";

import {
  CreateSectionModal,
  SkeletonSectionsList,
  SectionCard,
} from "../components";
import { useRefresh, useSectionsList } from "../hooks";
import { createStyles } from "../utils";
import { useTheme } from "../contexts";

export const SectionsScreen = () => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const navigation = useNavigation<NavigationProperty>();

  const {
    sections,
    isLoading,
    modalVisible,
    setModalVisible,
    newSectionName,
    setNewSectionName,
    handleRefresh,
    handleCreateSection,
    handleDeleteSection,
    handlePressSection,
  } = useSectionsList();

  const { RefreshableFlatList } = useRefresh({
    queryKeys: [["sections"]],
  });

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            padding: 8,
          }}
        >
          <TouchableOpacity onPress={() => navigation.navigate("Filters")}>
            <MaterialIcons
              name="filter-list"
              size={28}
              color={colors.primary}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleRefresh} style={styles.headerButton}>
            <MaterialIcons name="refresh" size={24} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("Calendar")}>
            <MaterialIcons
              name={"calendar-today"}
              size={24}
              style={styles.headerButton}
              color={colors.primary}
            />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, colors]);

  if (isLoading) {
    return <SkeletonSectionsList />;
  }

  return (
    <View style={styles.container}>
      <RefreshableFlatList
        data={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SectionCard
            section={item}
            onPress={handlePressSection}
            onLongPress={handleDeleteSection}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <MaterialIcons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      <CreateSectionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        sectionName={newSectionName}
        setSectionName={setNewSectionName}
        onCreate={handleCreateSection}
      />
    </View>
  );
};

const getStyles = createStyles((colors) => ({
  headerButton: {
    padding: 4,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    backgroundColor: colors.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
}));

export default SectionsScreen;
