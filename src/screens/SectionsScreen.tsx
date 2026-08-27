import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
  RefreshControl,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTheme } from "../contexts/ThemeContext";
import { ThemeColors } from "../theme/colors";
import {
  useSections,
  useCreateSection,
  useDeleteSection,
} from "../hooks/useSections";
import { Section } from "../types";
import { RootStackParamList } from "../../App";
import Icon from "react-native-vector-icons/MaterialIcons";

const SECTION_ICONS: Record<string, string> = {
  rules: "rule",
  dates: "event",
  plans: "assignment",
  notes: "note",
  questions: "help",
  contacts: "contacts",
  definitions: "book",
  discasses: "chat",
  fanfics: "history-edu",
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function SectionsScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const navigation = useNavigation<NavigationProp>();

  const { data: sections = [], isLoading, refetch } = useSections();
  const createMutation = useCreateSection();
  const deleteMutation = useDeleteSection();

  const [modalVisible, setModalVisible] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity
            onPress={() => navigation.navigate("Filters")}
            style={{ marginRight: 16 }}
          >
            <Icon name="filter-list" size={28} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleRefresh} style={styles.headerButton}>
            <Icon name="refresh" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, colors]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleCreateSection = async () => {
    if (!newSectionName.trim()) {
      Alert.alert("Ошибка", "Введите название секции");
      return;
    }
    try {
      await createMutation.mutateAsync({
        name: newSectionName.trim(),
        slug: undefined,
        isSystem: false,
        order: undefined,
      });
      setNewSectionName("");
      setModalVisible(false);
    } catch (error) {
      Alert.alert("Ошибка", "Не удалось создать секцию");
    }
  };

  const handleDeleteSection = (section: Section) => {
    if (section.isSystem) {
      Alert.alert("Системная секция", "Системные секции нельзя удалить");
      return;
    }
    Alert.alert(
      "Удалить секцию?",
      `Все записи в секции "${section.name}" также будут удалены.`,
      [
        { text: "Отмена", style: "cancel" },
        {
          text: "Удалить",
          style: "destructive",
          onPress: () => deleteMutation.mutate(section.id),
        },
      ],
    );
  };

  const handlePress = (section: Section) => {
    navigation.navigate("Records", {
      sectionId: section.id,
      title: section.name,
    });
  };

  const getIcon = (section: Section) => {
    if (section.isSystem && SECTION_ICONS[section.slug]) {
      return SECTION_ICONS[section.slug];
    }
    return "folder";
  };

  const renderItem = ({ item }: { item: Section }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handlePress(item)}
      onLongPress={() => handleDeleteSection(item)}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Icon name={getIcon(item)} size={32} color={colors.primary} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.name}</Text>
        <Text style={styles.count}>{item._count?.records || 0} записей</Text>
      </View>
      {item.isSystem && (
        <View style={styles.systemBadge}>
          <Text style={styles.systemBadgeText}>Сист.</Text>
        </View>
      )}
      <Icon name="chevron-right" size={24} color={colors.textMuted} />
    </TouchableOpacity>
  );

  if (isLoading && !refreshing) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
          />
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Icon name="add" size={28} color="#fff" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Создать секцию</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Название секции"
              placeholderTextColor={colors.textMuted}
              value={newSectionName}
              onChangeText={setNewSectionName}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancel]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCreate]}
                onPress={handleCreateSection}
              >
                <Text style={[styles.modalButtonText, { color: "#fff" }]}>
                  Создать
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    center: {
      justifyContent: "center",
      alignItems: "center",
    },
    listContent: {
      padding: 16,
      paddingBottom: 80,
    },
    headerButton: {
      marginRight: 16,
      padding: 4,
    },
    card: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.inputBackground,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 16,
    },
    textContainer: {
      flex: 1,
    },
    title: {
      fontSize: 17,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 2,
    },
    count: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    systemBadge: {
      backgroundColor: colors.inputBackground,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 10,
      marginRight: 8,
    },
    systemBadgeText: {
      fontSize: 10,
      color: colors.textMuted,
    },
    fab: {
      position: "absolute",
      bottom: 24,
      right: 24,
      backgroundColor: colors.primary,
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: "center",
      alignItems: "center",
      elevation: 4,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContent: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 24,
      width: "80%",
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 16,
    },
    modalInput: {
      borderWidth: 1,
      borderColor: colors.inputBorder,
      backgroundColor: colors.inputBackground,
      color: colors.text,
      padding: 12,
      borderRadius: 8,
      marginBottom: 16,
    },
    modalButtons: {
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: 12,
    },
    modalButton: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 8,
    },
    modalCancel: {
      backgroundColor: colors.inputBackground,
    },
    modalCreate: {
      backgroundColor: colors.primary,
    },
    modalButtonText: {
      fontSize: 16,
      color: colors.text,
    },
  });
