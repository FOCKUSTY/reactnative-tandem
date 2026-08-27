import type { NavigationProperty } from "../types";

import { MaterialIcons } from "@react-native-vector-icons/material-icons";
import { useNavigation } from "@react-navigation/native";
import { View, TouchableOpacity } from "react-native";
import { useLayoutEffect } from "react";

import { SectionsList, CreateSectionModal } from "../components";
import { useSectionsList } from "../hooks";
import { createStyles } from "../utils";
import { useTheme } from "../contexts";

export const SectionsScreen = () => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const navigation = useNavigation<NavigationProperty>();

  const {
    sections,
    isLoading,
    refreshing,
    modalVisible,
    setModalVisible,
    newSectionName,
    setNewSectionName,
    handleRefresh,
    handleCreateSection,
    handleDeleteSection,
    handlePressSection,
  } = useSectionsList();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity
            onPress={() => navigation.navigate("Filters")}
            style={{ marginRight: 16 }}
          >
            <MaterialIcons
              name="filter-list"
              size={28}
              color={colors.primary}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleRefresh} style={styles.headerButton}>
            <MaterialIcons name="refresh" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, colors]);

  return (
    <View style={styles.container}>
      <SectionsList
        sections={sections}
        isLoading={isLoading}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        onPress={handlePressSection}
        onLongPress={handleDeleteSection}
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
    marginRight: 16,
    padding: 4,
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
