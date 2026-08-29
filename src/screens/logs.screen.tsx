import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { MaterialIcons } from "@react-native-vector-icons/material-icons";
import { useState, useEffect } from "react";

import { isAvailableAsync, shareAsync } from "expo-sharing";

import { createStyles, logger } from "../utils";
import { useTranslate } from "../hooks";
import { useTheme } from "../contexts";
import { SkeletonLogs } from "../components";

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
      Alert.alert(t("common.error"), t("logs.errorLoad"));
    } finally {
      setLoading(false);
    }
  };

  const clearLogs = async () => {
    Alert.alert(t("logs.clearConfirm.title"), t("logs.clearConfirm.message"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("logs.clear"),
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
          dialogTitle: t("logs.title"),
          UTI: "public.plain-text",
        });
      } else {
        Alert.alert(t("common.error"), t("logs.sharingUnavailable"));
      }
    } catch (error) {
      Alert.alert(t("common.error"), t("logs.exportError"));
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  if (loading) {
    return <SkeletonLogs />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("logs.title")}</Text>
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
