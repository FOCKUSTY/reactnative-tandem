import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { MaterialIcons } from "@react-native-vector-icons/material-icons";
import { useState, useEffect } from "react";

import { isAvailableAsync, shareAsync } from "expo-sharing";

import { createStyles, logger } from "../utils";
import { useTranslate } from "../hooks";
import { useTheme } from "../contexts";

export const LogsScreen = () => {
  const { colors } = useTheme();
  const { t } = useTranslate();
  const styles = getStyles(colors);
  const [logs, setLogs] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const content = await logger.getFormattedLogs();
      setLogs(content);
    } catch (error) {
      Alert.alert("Ошибка", "Не удалось загрузить логи");
    } finally {
      setLoading(false);
    }
  };

  const clearLogs = async () => {
    Alert.alert("Очистить логи?", "Это действие нельзя отменить.", [
      { text: "Отмена", style: "cancel" },
      {
        text: "Очистить",
        style: "destructive",
        onPress: async () => {
          await logger.clearLogs();
          setLogs("");
        },
      },
    ]);
  };

  const exportLogs = async () => {
    try {
      const fileUri = await logger.exportLogs("text");
      if (await isAvailableAsync()) {
        await shareAsync(fileUri, {
          mimeType: "text/plain",
          dialogTitle: "Экспорт логов",
          UTI: "public.plain-text",
        });
      } else {
        Alert.alert("Ошибка", "Шаринг не поддерживается на этом устройстве");
      }
    } catch (error) {
      Alert.alert("Ошибка", "Не удалось экспортировать логи");
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Логи приложения</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={exportLogs} style={styles.iconButton}>
            <MaterialIcons name="share" size={24} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={loadLogs} style={styles.iconButton}>
            <MaterialIcons name="refresh" size={24} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={clearLogs} style={styles.iconButton}>
            <MaterialIcons
              name="delete-sweep"
              size={24}
              color={colors.danger}
            />
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView style={styles.logContainer}>
        <Text style={styles.logText}>{logs}</Text>
      </ScrollView>
    </View>
  );
};

const getStyles = createStyles((colors) => ({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: { fontSize: 20, fontWeight: "bold", color: colors.text },
  headerActions: { flexDirection: "row", gap: 12 },
  iconButton: { padding: 4 },
  logContainer: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  logText: {
    fontFamily: "monospace",
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
}));
