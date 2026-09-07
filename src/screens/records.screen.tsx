import { View, TouchableOpacity, Text } from "react-native";
import { MaterialIcons } from "@react-native-vector-icons/material-icons";
import { useNavigation } from "@react-navigation/native";
import { useLayoutEffect } from "react";

import { RecordCard, SkeletonRecordsList } from "../components";
import { useRecordsList, useRefresh } from "../hooks";
import { createStyles } from "../utils";
import { useTheme } from "../contexts";
import { useTranslate } from "../hooks";

export const RecordsScreen = () => {
  const { t } = useTranslate();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { records, isLoading, title, handleDelete, handleCreate } =
    useRecordsList();

  const { RefreshableFlatList } = useRefresh({
    queryKeys: [["records"]],
  });

  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      title,
      headerRight: () => (
        <TouchableOpacity onPress={handleCreate} style={styles.headerButton}>
          <MaterialIcons name="add" size={28} color={colors.primary} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, title, colors]);

  if (isLoading) {
    return <SkeletonRecordsList />;
  }

  if (records.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialIcons name="inbox" size={64} color={colors.textMuted} />
        <Text style={styles.emptyText}>{t("records.empty")}</Text>
        <TouchableOpacity style={styles.emptyButton} onPress={handleCreate}>
          <Text style={styles.emptyButtonText}>{t("records.createFirst")}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <RefreshableFlatList
        data={records}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RecordCard record={item} onDelete={handleDelete} showDelete />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const getStyles = createStyles((colors) => ({
  headerButton: {
    marginRight: 16,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textMuted,
    marginTop: 12,
    marginBottom: 20,
    textAlign: "center",
  },
  emptyButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
}));

export default RecordsScreen;
