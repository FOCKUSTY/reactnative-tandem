import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { useRecords } from "../hooks/useRecords";
import { MyRecord } from "../types";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";
import PartnerLinkBanner from "../components/PartnerLinkBanner";
import { useTheme } from "../contexts/ThemeContext";
import { ThemeColors } from "../theme/colors";

const getDatesView = (
  dates: MyRecord[],
  navigation: NativeStackNavigationProp<RootStackParamList>,
  styles: ReturnType<typeof getStyles>,
) => {
  if (dates.length === 0) {
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Ближайшие даты</Text>
        <Text style={styles.emptyText}>Нет предстоящих дат</Text>
        <TouchableOpacity
          style={[styles.button, styles.addButton]}
          onPress={() =>
            navigation.navigate("CreateRecord", { section: "dates" })
          }
        >
          <Text style={styles.buttonText}>Добавить дату</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Ближайшие даты:</Text>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        {dates.map((date) => (
          <View key={date.id} style={styles.dateItem}>
            <Text style={styles.cardDate}>
              {new Date(date.dateEvent!).toLocaleDateString()}
            </Text>
            <Text style={styles.cardText}>{date.content?.slice(0, 100)}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const getPlansView = (
  plansCount: number,
  navigation: NativeStackNavigationProp<RootStackParamList>,
  styles: ReturnType<typeof getStyles>,
) => {
  if (plansCount === 0) {
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Планы</Text>
        <Text style={styles.emptyText}>Нет активных планов</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            navigation.navigate("CreateRecord", { section: "plans" })
          }
        >
          <Text style={styles.buttonText}>Создать план</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Планы (осталось {plansCount})</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          navigation.navigate("Records", { section: "plans", title: "Планы" })
        }
      >
        <Text style={styles.buttonText}>Перейти к планам</Text>
      </TouchableOpacity>
    </View>
  );
};

export default function HomeScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const styles = getStyles(colors);

  const { data: dates = [] } = useRecords("dates");
  const { data: plans = [] } = useRecords("plans");

  const incompletePlans = plans.filter((p) => !p.isCompleted).length;
  const upcomingDates = dates
    .filter((d) => d.dateEvent && new Date(d.dateEvent) >= new Date())
    .sort(
      (a, b) =>
        new Date(a.dateEvent!).getTime() - new Date(b.dateEvent!).getTime(),
    )
    .slice(0, 5);

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>Привет, {user?.name}</Text>

      <PartnerLinkBanner />

      {getDatesView(upcomingDates, navigation, styles)}
      {getPlansView(incompletePlans, navigation, styles)}
    </View>
  );
}

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: colors.background,
      gap: 8,
    },
    greeting: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 16,
    },
    card: {
      backgroundColor: colors.card,
      padding: 16,
      borderRadius: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 8,
    },
    cardText: {
      color: colors.textSecondary,
    },
    button: {
      backgroundColor: colors.primary,
      padding: 12,
      borderRadius: 8,
      marginTop: 8,
      alignItems: "center",
    },
    buttonText: {
      color: "#fff",
      textAlign: "center",
      fontWeight: "600",
    },
    addButton: {
      backgroundColor: colors.success,
      marginTop: 4,
    },
    scrollView: {
      height: 200,
      width: "100%",
      backgroundColor: colors.scrollBackground,
      borderRadius: 10,
      marginTop: 4,
    },
    scrollContent: {
      padding: 10,
    },
    dateItem: {
      marginBottom: 12,
      borderBottomWidth: 1,
      borderColor: colors.cardBorder,
      paddingBottom: 8,
    },
    cardDate: {
      fontSize: 16,
      color: colors.primary,
      marginBottom: 4,
    },
    emptyText: {
      textAlign: "center",
      color: colors.textMuted,
      marginVertical: 8,
    },
  });
