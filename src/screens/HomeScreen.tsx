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
import { useSections } from "../hooks/useSections";

const getFilteredRecords = (
  records: MyRecord[],
  options?: {
    onlyFuture?: boolean;
    hideCompleted?: boolean;
  },
): MyRecord[] => {
  let filtered = [...records];

  if (options?.onlyFuture) {
    const now = new Date();
    filtered = filtered.filter(
      (r) => r.dateEvent && new Date(r.dateEvent) >= now,
    );
  }

  if (options?.hideCompleted) {
    filtered = filtered.filter((r) => !r.isCompleted);
  }

  return filtered.sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;

    if (a.dateEvent && b.dateEvent) {
      return new Date(a.dateEvent).getTime() - new Date(b.dateEvent).getTime();
    }
    if (a.dateEvent && !b.dateEvent) return -1;
    if (!a.dateEvent && b.dateEvent) return 1;

    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
};

const SectionPreview = ({
  records,
  sectionSlug,
  title,
  emptyMessage,
  createLabel = "Добавить",
  viewAllLabel = "Перейти",
  limit = 5,
}: {
  records: MyRecord[];
  sectionSlug: string;
  title: string;
  emptyMessage: string;
  createLabel?: string;
  viewAllLabel?: string;
  limit?: number;
}) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { data: sections } = useSections();
  const section = sections?.find((s) => s.slug === sectionSlug);

  const displayRecords = records.slice(0, limit);
  const hasMore = records.length > limit;

  const handleCreate = () => {
    if (section) {
      navigation.navigate("CreateRecord", { sectionId: section.id });
    }
  };

  const handleViewAll = () => {
    if (section) {
      navigation.navigate("Records", { sectionId: section.id, title });
    }
  };

  const handleRecordPress = (record: MyRecord) => {
    navigation.navigate("RecordDetail", { id: record.id });
  };

  if (records.length === 0) {
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.emptyText}>{emptyMessage}</Text>
        <TouchableOpacity
          style={[styles.button, styles.addButton]}
          onPress={handleCreate}
        >
          <Text style={styles.buttonText}>{createLabel}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        {displayRecords.map((record) => (
          <TouchableOpacity
            key={record.id}
            style={styles.dateItem}
            onPress={() => handleRecordPress(record)}
            activeOpacity={0.6}
          >
            {record.isPinned && (
              <Text style={styles.pinnedBadge}>📌 Закреплено</Text>
            )}
            {record.dateEvent && (
              <Text style={styles.cardDate}>
                {new Date(record.dateEvent).toLocaleDateString("ru-ru")}
              </Text>
            )}
            <Text style={styles.cardText} numberOfLines={2}>
              {record.content?.slice(0, 100) ||
                record.title ||
                "Без содержания"}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.button, styles.addButtonSmall]}
          onPress={handleCreate}
        >
          <Text style={styles.buttonText}>{createLabel}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.viewAllButton]}
          onPress={handleViewAll}
        >
          <Text style={styles.buttonText}>
            {hasMore
              ? `${viewAllLabel} (ещё ${records.length - limit})`
              : viewAllLabel}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function HomeScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();

  const { data: allRecords = [] } = useRecords();

  const upcomingDates = getFilteredRecords(allRecords, {
    onlyFuture: true,
  }).filter((r) => r.section?.slug !== "plans");

  const activePlans = getFilteredRecords(allRecords, {
    onlyFuture: true,
    hideCompleted: true,
  }).filter((r) => r.section?.slug === "plans");

  return (
    <View style={getStyles(colors).container}>
      <Text style={getStyles(colors).greeting}>Привет, {user?.name}</Text>

      <PartnerLinkBanner />

      <SectionPreview
        records={upcomingDates}
        sectionSlug="dates"
        title="Ближайшие даты"
        emptyMessage="Нет предстоящих дат"
        createLabel="Добавить дату"
        viewAllLabel="Все даты"
      />

      <SectionPreview
        records={activePlans}
        sectionSlug="plans"
        title="Активные планы"
        emptyMessage="Нет активных планов"
        createLabel="Создать план"
        viewAllLabel="Все планы"
      />
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
      alignItems: "center",
      justifyContent: "center",
    },
    buttonText: {
      color: "#fff",
      textAlign: "center",
      fontWeight: "600",
      fontSize: 14,
    },
    addButton: {
      backgroundColor: colors.success,
    },
    addButtonSmall: {
      flex: 1,
      marginRight: 8,
    },
    viewAllButton: {
      flex: 1,
      marginLeft: 8,
    },
    actionsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 8,
    },
    scrollView: {
      maxHeight: 200,
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
    pinnedBadge: {
      fontSize: 12,
      color: colors.primary,
      fontWeight: "600",
      marginBottom: 2,
    },
    emptyText: {
      textAlign: "center",
      color: colors.textMuted,
      marginVertical: 8,
    },
  });
