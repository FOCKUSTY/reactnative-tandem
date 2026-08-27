import type { Section } from "../../types";

import { FlatList, RefreshControl, View } from "react-native";
import { ActivityIndicator } from "react-native";

import { SectionCard } from "./section-card.component";
import { useTheme } from "../../contexts";
import { createStyles } from "../../utils";

export type SectionsListProps = {
  sections: Section[];
  isLoading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onPress: (section: Section) => void;
  onLongPress: (section: Section) => void;
};

export const SectionsList = ({
  sections,
  isLoading,
  refreshing,
  onRefresh,
  onPress,
  onLongPress,
}: SectionsListProps) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  if (isLoading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <FlatList
      data={sections}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <SectionCard
          section={item}
          onPress={onPress}
          onLongPress={onLongPress}
        />
      )}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.primary]}
        />
      }
    />
  );
};

const getStyles = createStyles(() => ({
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
}));
