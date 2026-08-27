import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";
import { useTheme } from "../contexts/ThemeContext";
import { ThemeColors } from "../theme/colors";
import { useRecord } from "../hooks/useRecord";
import { useDeleteRecord } from "../hooks/useRecords";
import Icon from "react-native-vector-icons/MaterialIcons";
import Markdown from "react-native-markdown-renderer";
import { getMarkdownStyles } from "../theme/markdownStyles";

type RecordDetailRouteProp = {
  key: string;
  name: "RecordDetail";
  params: { id: string };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function RecordDetail() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const markdownStyles = getMarkdownStyles(colors);

  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RecordDetailRouteProp>();
  const { id } = route.params;

  const { data: record, isLoading, error } = useRecord(id);
  const deleteMutation = useDeleteRecord();

  React.useLayoutEffect(() => {
    if (record) {
      navigation.setOptions({
        title: record.title || "Запись",
        headerRight: () => (
          <View style={styles.headerButtons}>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("CreateRecord", {
                  sectionId: record.sectionId,
                  record,
                })
              }
              style={styles.headerButton}
            >
              <Icon name="edit" size={24} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDelete}
              style={[styles.headerButton, { marginLeft: 16 }]}
            >
              <Icon name="delete-outline" size={24} color={colors.danger} />
            </TouchableOpacity>
          </View>
        ),
      });
    }
  }, [navigation, record, colors]);

  const handleDelete = () => {
    if (!record) return;
    Alert.alert("Удалить запись?", "Это действие нельзя отменить.", [
      { text: "Отмена", style: "cancel" },
      {
        text: "Удалить",
        style: "destructive",
        onPress: () => {
          deleteMutation.mutate(id, {
            onSuccess: () => navigation.goBack(),
          });
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>Загрузка...</Text>
      </View>
    );
  }

  if (error || !record) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Icon name="error-outline" size={48} color={colors.danger} />
        <Text style={styles.errorText}>
          {error ? "Не удалось загрузить запись" : "Запись не найдена"}
        </Text>
      </View>
    );
  }

  const dateLabel = record.dateEvent
    ? new Date(record.dateEvent).toLocaleDateString()
    : null;
  const timeLabel = record.dateEvent
    ? new Date(record.dateEvent).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        {record.title && <Text style={styles.title}>{record.title}</Text>}

        {dateLabel && (
          <View style={styles.dateContainer}>
            <Icon name="event" size={20} color={colors.primary} />
            <Text style={styles.dateText}>
              {dateLabel} {timeLabel ? `в ${timeLabel}` : ""}
            </Text>
          </View>
        )}

        <Markdown style={markdownStyles}>{record.content || ""}</Markdown>

        {record.tags && record.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {record.tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.metaContainer}>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Статус:</Text>
            <Text
              style={[styles.metaValue, record.isCompleted && styles.completed]}
            >
              {record.isCompleted ? "✅ Выполнено" : "⏳ В процессе"}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Закреплено:</Text>
            <Text style={styles.metaValue}>
              {record.isPinned ? "📌 Да" : "Нет"}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Создано:</Text>
            <Text style={styles.metaValue}>
              {new Date(record.createdAt).toLocaleString()}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Обновлено:</Text>
            <Text style={styles.metaValue}>
              {new Date(record.updatedAt).toLocaleString()}
            </Text>
          </View>
        </View>
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
    centered: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    loadingText: {
      color: colors.textSecondary,
      fontSize: 16,
    },
    errorText: {
      color: colors.danger,
      fontSize: 16,
      marginTop: 12,
    },
    content: {
      padding: 16,
      paddingBottom: 32,
    },
    headerButtons: {
      flexDirection: "row",
      alignItems: "center",
    },
    headerButton: {
      padding: 4,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    title: {
      fontSize: 22,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 12,
    },
    dateContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },
    dateText: {
      fontSize: 16,
      color: colors.primary,
      marginLeft: 8,
    },
    tagsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginBottom: 16,
    },
    tag: {
      backgroundColor: colors.inputBackground,
      borderRadius: 14,
      paddingHorizontal: 12,
      paddingVertical: 6,
      marginRight: 8,
      marginBottom: 6,
    },
    tagText: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    metaContainer: {
      borderTopWidth: 1,
      borderTopColor: colors.cardBorder,
      paddingTop: 12,
    },
    metaRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 4,
    },
    metaLabel: {
      fontSize: 14,
      color: colors.textMuted,
    },
    metaValue: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    completed: {
      color: colors.success,
    },
  });
