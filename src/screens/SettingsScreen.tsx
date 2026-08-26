import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";
import { useTheme } from "../contexts/ThemeContext";
import { ThemeColors } from "../theme/colors";
import Icon from "react-native-vector-icons/Feather";

type SettingsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Settings"
>;

export default function SettingsScreen() {
  const { user, me, logout } = useAuth();
  const { colors, mode, toggleTheme } = useTheme();
  const styles = getStyles(colors);
  const navigation = useNavigation<SettingsScreenNavigationProp>();

  const handleLogout = () => {
    Alert.alert("Выход", "Вы уверены, что хотите выйти?", [
      { text: "Отмена", style: "cancel" },
      { text: "Выйти", style: "destructive", onPress: logout },
    ]);
  };

  const isPartnerLinked = !!me?.partnerId;

  // Компонент элемента списка настроек
  const SettingsItem = ({
    icon,
    label,
    onPress,
    rightElement,
  }: {
    icon: string;
    label: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
  }) => (
    <TouchableOpacity
      style={styles.settingsItem}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      <View style={styles.itemLeft}>
        <Icon
          name={icon}
          size={22}
          color={colors.primary}
          style={styles.itemIcon}
        />
        <Text style={styles.itemLabel}>{label}</Text>
      </View>
      <View style={styles.itemRight}>
        {rightElement || (
          <Icon name="chevron-right" size={20} color={colors.textMuted} />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Профиль</Text>
        <View style={styles.card}>
          <SettingsItem
            icon="user"
            label={user?.name || user?.username || "Пользователь"}
            rightElement={
              <Text style={styles.valueText}>{user?.username}</Text>
            }
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Партнёр</Text>
        <View style={styles.card}>
          <SettingsItem
            icon="users"
            label="Привязка партнёра"
            onPress={() => navigation.navigate("LinkPartner")}
            rightElement={
              <View style={styles.statusBadge}>
                <Text
                  style={[
                    styles.statusText,
                    isPartnerLinked
                      ? styles.statusLinked
                      : styles.statusNotLinked,
                  ]}
                >
                  {isPartnerLinked ? "Привязан" : "Не привязан"}
                </Text>
                <Icon name="chevron-right" size={20} color={colors.textMuted} />
              </View>
            }
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Внешний вид</Text>
        <View style={styles.card}>
          <SettingsItem
            icon="moon"
            label="Тёмная тема"
            rightElement={
              <Switch
                value={mode === "dark"}
                onValueChange={toggleTheme}
                trackColor={{ false: colors.inputBorder, true: colors.primary }}
                thumbColor={colors.text}
              />
            }
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>О приложении</Text>
        <View style={styles.card}>
          <SettingsItem
            icon="info"
            label="Версия"
            rightElement={<Text style={styles.valueText}>1.0.0</Text>}
          />
          <SettingsItem
            icon="heart"
            label="Сделано с любовью"
            rightElement={<Text style={styles.valueText}>❤️</Text>}
          />
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Icon name="log-out" size={20} color={colors.danger} />
        <Text style={styles.logoutText}>Выйти</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Тандем v1.0.0</Text>
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
    content: {
      padding: 16,
      paddingBottom: 40,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.textMuted,
      textTransform: "uppercase",
      marginBottom: 8,
      paddingHorizontal: 4,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      overflow: "hidden",
    },
    settingsItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.cardBorder,
    },
    itemLeft: {
      flexDirection: "row",
      alignItems: "center",
    },
    itemIcon: {
      marginRight: 12,
    },
    itemLabel: {
      fontSize: 16,
      color: colors.text,
    },
    itemRight: {
      flexDirection: "row",
      alignItems: "center",
    },
    valueText: {
      fontSize: 14,
      color: colors.textSecondary,
      marginRight: 4,
    },
    statusBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    statusText: {
      fontSize: 14,
      fontWeight: "500",
    },
    statusLinked: {
      color: colors.success,
    },
    statusNotLinked: {
      color: colors.textMuted,
    },
    logoutButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.card,
      padding: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      marginTop: 8,
      gap: 10,
    },
    logoutText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.danger,
    },
    footer: {
      marginTop: 24,
      alignItems: "center",
    },
    footerText: {
      fontSize: 12,
      color: colors.textMuted,
    },
  });
