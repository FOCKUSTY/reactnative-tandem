import type { SessionInfo } from "../types";

import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { MaterialIcons } from "@react-native-vector-icons/material-icons";

import { createStyles, formatDate, formatDateTime } from "../utils";
import { useTheme } from "../contexts";
import { useRefresh, useSessions, useTranslate } from "../hooks";

export const SessionsScreen = () => {
  const { colors } = useTheme();
  const { t } = useTranslate();
  const styles = getStyles(colors);
  const {
    sessions,
    isLoading,
    error,
    reload,
    isCurrent,
    confirmRevoke,
    confirmLogoutAll,
  } = useSessions();
  const { RefreshableScrollView } = useRefresh({ onRefresh: reload });

  const renderDeviceLine = (session: SessionInfo) =>
    [session.platform, session.appVersion].filter(Boolean).join(" • ");

  const renderSession = (session: SessionInfo) => {
    const current = isCurrent(session);
    const deviceLine = renderDeviceLine(session);

    return (
      <View key={session.id} style={styles.card}>
        <View style={styles.cardHeader}>
          <MaterialIcons
            name="devices"
            size={22}
            color={colors.primary}
            style={styles.cardIcon}
          />
          <Text style={styles.deviceName} numberOfLines={1}>
            {session.deviceName || t("sessions.unknownDevice")}
          </Text>
          {current && (
            <Text style={styles.currentBadge}>{t("sessions.current")}</Text>
          )}
        </View>

        {!!deviceLine && <Text style={styles.meta}>{deviceLine}</Text>}
        <Text style={styles.meta}>
          {t("sessions.lastUsed")}: {formatDateTime(session.lastUsedAt)}
        </Text>
        <Text style={styles.meta}>
          {t("sessions.expires")}:{" "}
          {session.expiresAt
            ? formatDate(session.expiresAt)
            : t("sessions.forever")}
        </Text>

        <TouchableOpacity
          style={styles.revokeButton}
          onPress={() => confirmRevoke(session)}
        >
          <Text style={styles.revokeText}>{t("sessions.revoke")}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <RefreshableScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : sessions.length === 0 ? (
        <Text style={styles.empty}>{t("sessions.empty")}</Text>
      ) : (
        sessions.map(renderSession)
      )}

      <TouchableOpacity
        style={styles.logoutAllButton}
        onPress={confirmLogoutAll}
      >
        <Text style={styles.logoutAllText}>{t("sessions.logoutAll")}</Text>
      </TouchableOpacity>
    </RefreshableScrollView>
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
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  cardIcon: {
    marginRight: 10,
  },
  deviceName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  currentBadge: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.primary,
    backgroundColor: colors.bannerBackground,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    overflow: "hidden",
  },
  meta: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  revokeButton: {
    alignSelf: "flex-start",
    marginTop: 8,
  },
  revokeText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.danger,
  },
  empty: {
    textAlign: "center",
    color: colors.textMuted,
    marginTop: 24,
    marginBottom: 24,
  },
  error: {
    textAlign: "center",
    color: colors.danger,
    marginTop: 24,
    marginBottom: 24,
  },
  logoutAllButton: {
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.danger,
  },
  logoutAllText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.danger,
  },
}));

export default SessionsScreen;
