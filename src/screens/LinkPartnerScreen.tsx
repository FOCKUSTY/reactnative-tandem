import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { usersService } from "../api/services/users.service";
import { useTheme } from "../contexts/ThemeContext";
import { ThemeColors } from "../theme/colors";

export default function LinkPartnerScreen() {
  const { me, refreshMe } = useAuth();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [partnerUsername, setPartnerUsername] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLink = async () => {
    if (!partnerUsername.trim()) {
      Alert.alert("Ошибка", "Введите имя пользователя партнёра");
      return;
    }
    setLoading(true);
    try {
      await usersService.linkPartner(partnerUsername.trim());
      await refreshMe();
      Alert.alert("Успех", "Партнёр успешно привязан!");
      setPartnerUsername("");
    } catch (error: any) {
      Alert.alert(
        "Ошибка",
        error.response?.data?.message || "Не удалось привязать",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Не будьте одиноки</Text>
      {me?.partnerId ? (
        <View style={styles.linkedContainer}>
          <Text style={styles.linkedText}>Вы уже привязаны</Text>
          <Text style={styles.linkedSubtext}>
            Партнёр: {me.partner?.name || me.partner?.username || "неизвестно"}
          </Text>
        </View>
      ) : (
        <>
          <Text style={styles.description}>
            Введите имя пользователя вашей второй половинки, чтобы видеть общие
            записи.
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Имя пользователя"
            placeholderTextColor={colors.textMuted}
            value={partnerUsername}
            onChangeText={setPartnerUsername}
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLink}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Привязка..." : "Привязать"}
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: colors.background,
    },
    title: {
      fontSize: 22,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 20,
    },
    description: {
      fontSize: 16,
      color: colors.textSecondary,
      marginBottom: 16,
      lineHeight: 22,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.inputBorder,
      backgroundColor: colors.inputBackground,
      color: colors.text,
      padding: 12,
      borderRadius: 8,
      marginBottom: 16,
    },
    button: {
      backgroundColor: colors.primary,
      padding: 14,
      borderRadius: 8,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    buttonText: {
      color: "#fff",
      textAlign: "center",
      fontWeight: "bold",
    },
    linkedContainer: {
      backgroundColor: "#1E3A2A",
      padding: 16,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: "#2E5A3A",
    },
    linkedText: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.success,
    },
    linkedSubtext: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 4,
    },
  });
