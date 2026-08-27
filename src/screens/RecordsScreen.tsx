import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";
import { useTheme } from "../contexts/ThemeContext";
import { ThemeColors } from "../theme/colors";
import { useRecords, useDeleteRecord } from "../hooks/useRecords";
import { MyRecord } from "../types";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useFilters } from "../contexts/FiltersContext";

type RecordsScreenRouteProp = {
  key: string;
  name: "Records";
  params: { sectionId: string; title: string };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function RecordsScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RecordsScreenRouteProp>();
  const { sectionId, title } = route.params;

  const { data: records = [], isLoading } = useRecords({
    sectionIds: [sectionId],
  });
  const deleteMutation = useDeleteRecord();

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title,
      headerRight: () => (
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("CreateRecord", {
              sectionId,
              record: undefined,
            })
          }
          style={styles.headerButton}
        >
          <Icon name="add" size={28} color={colors.primary} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, title, sectionId, colors]);

  const handleDelete = (id: string) => {
    Alert.alert("Удалить запись?", "Это действие нельзя отменить.", [
      { text: "Отмена", style: "cancel" },
      {
        text: "Удалить",
        style: "destructive",
        onPress: () => deleteMutation.mutate(id),
      },
    ]);
  };

  const renderItem = ({ item }: { item: MyRecord }) => {
    const dateLabel = item.dateEvent
      ? new Date(item.dateEvent).toLocaleDateString()
      : null;
    const contentPreview =
      item.content && item.content.length > 120
        ? item.content.slice(0, 120) + "..."
        : item.content;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("RecordDetail", { id: item.id })}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.title || "Без заголовка"}</Text>
          <TouchableOpacity
            onPress={() => handleDelete(item.id)}
            style={styles.deleteButton}
          >
            <Icon name="delete-outline" size={22} color={colors.danger} />
          </TouchableOpacity>
        </View>

        {dateLabel && <Text style={styles.cardDate}>📅 {dateLabel}</Text>}

        {contentPreview && (
          <Text style={styles.cardContent} numberOfLines={3}>
            {contentPreview}
          </Text>
        )}

        {item.tags && item.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {item.tags.slice(0, 3).map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
            {item.tags.length > 3 && (
              <Text style={styles.tagMore}>+{item.tags.length - 3}</Text>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (records.length === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Icon name="inbox" size={64} color={colors.textMuted} />
        <Text style={styles.emptyText}>Нет записей в этом разделе</Text>
        <TouchableOpacity
          style={styles.emptyButton}
          onPress={() =>
            navigation.navigate("CreateRecord", {
              sectionId,
              record: undefined,
            })
          }
        >
          <Text style={styles.emptyButtonText}>Создать первую запись</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={records}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    centered: {
      justifyContent: "center",
      alignItems: "center",
      padding: 24,
    },
    listContent: {
      padding: 16,
      paddingBottom: 32,
    },
    headerButton: {
      marginRight: 16,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 6,
    },
    cardTitle: {
      fontSize: 17,
      fontWeight: "600",
      color: colors.text,
      flex: 1,
      marginRight: 8,
    },
    deleteButton: {
      padding: 4,
    },
    cardDate: {
      fontSize: 14,
      color: colors.primary,
      marginBottom: 4,
    },
    cardContent: {
      fontSize: 15,
      color: colors.textSecondary,
      lineHeight: 22,
      marginTop: 2,
    },
    tagsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginTop: 8,
    },
    tag: {
      backgroundColor: colors.inputBackground,
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 4,
      marginRight: 6,
      marginBottom: 4,
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
  });
