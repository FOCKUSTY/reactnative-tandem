import { useState } from "react";
import {
  FlatList,
  View,
  useWindowDimensions,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from "react-native";

import { SectionPreview } from "./section-preview.component";
import type { MyRecord } from "../../types";
import { useTheme } from "../../contexts";
import { createStyles } from "../../utils";

export type SectionPagerItem = {
  key: string;
  slug: string;
  title: string;
  emptyMessage: string;
  createLabel?: string;
  viewAllLabel?: string;
  records: MyRecord[];
};

export const SectionPager = ({ items }: { items: SectionPagerItem[] }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { width } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);

  const PAGE_WIDTH = width - 32;

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / PAGE_WIDTH);
    if (idx !== activeIndex) setActiveIndex(idx);
  };

  return (
    <View>
      <FlatList
        data={items}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => (
          <View style={{ width: PAGE_WIDTH, padding: 8 }}>
            <SectionPreview
              records={item.records}
              sectionSlug={item.slug}
              title={item.title}
              emptyMessage={item.emptyMessage}
              createLabel={item.createLabel}
              viewAllLabel={item.viewAllLabel}
            />
          </View>
        )}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={PAGE_WIDTH}
        snapToAlignment="start"
        decelerationRate="fast"
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.content}
      />
      {items.length > 1 && (
        <View style={styles.dotsRow}>
          {items.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === activeIndex && styles.dotActive]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const getStyles = createStyles((colors) => ({
  content: {
    alignItems: "flex-start",
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.cardBorder,
  },
  dotActive: {
    backgroundColor: colors.primary,
  },
}));
