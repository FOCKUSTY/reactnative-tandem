import { View, Text, TouchableOpacity, Alert } from "react-native";
import { MaterialIcons } from "@react-native-vector-icons/material-icons";
import { useNavigation } from "@react-navigation/native";
import { useLayoutEffect } from "react";

import { TableCard, SkeletonRecordsList } from "../components";
import {
  useTables,
  useRefresh,
  useTranslate,
  useDuplicateTable,
} from "../hooks";
import { createStyles } from "../utils";
import { useTheme } from "../contexts";
import { NavigationProperty, Table } from "../types";

export const TablesScreen = () => {
  const { t } = useTranslate();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const navigation = useNavigation<NavigationProperty>();
  const { data: tables = [], isLoading } = useTables();

  const { RefreshableFlatList } = useRefresh({
    queryKeys: [["tables"], ["table-sections"]],
  });

  const duplicateTable = useDuplicateTable();

  const handleDuplicate = (table: Table) => {
    Alert.alert(
      t("tables.duplicateConfirm.title"),
      t("tables.duplicateConfirm.message", { name: table.name }),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.create"),
          onPress: () => {
            duplicateTable.mutate(
              { id: table.id },
              {
                onSuccess: (newTable) => {
                  navigation.navigate("TableDetail", {
                    tableId: newTable.id,
                    tableName: newTable.name,
                  });
                },
                onError: () => {
                  Alert.alert(
                    t("common.error"),
                    t("tables.errors.duplicateFailed"),
                  );
                },
              },
            );
          },
        },
      ],
    );
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: t("tables.title"),
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate("CreateTable", {})}
          style={styles.headerButton}
        >
          <MaterialIcons name="add" size={28} color={colors.primary} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, colors, t]);

  if (isLoading) {
    return <SkeletonRecordsList />;
  }

  if (tables.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialIcons name="table-rows" size={64} color={colors.textMuted} />
        <Text style={styles.emptyText}>{t("tables.noTables")}</Text>
        <TouchableOpacity
          style={styles.emptyButton}
          onPress={() => navigation.navigate("CreateTable", {})}
        >
          <Text style={styles.emptyButtonText}>{t("tables.createFirst")}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <RefreshableFlatList
        data={tables}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TableCard
            table={item}
            onPress={(table) =>
              navigation.navigate("TableDetail", {
                tableId: table.id,
                tableName: table.name,
              })
            }
            onLongPress={handleDuplicate}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const getStyles = createStyles((colors) => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  headerButton: {
    padding: 8,
    marginRight: 8,
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

export default TablesScreen;
