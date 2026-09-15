import { View, Text, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@react-native-vector-icons/material-icons";

import { useTheme } from "../../../contexts";
import { createStyles } from "../../../utils";

export type CellPagerProps = {
  label: string;
  prevIcon: string;
  nextIcon: string;
  current: number;
  total: number;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
};

export const CellPager = ({
  label,
  prevIcon,
  nextIcon,
  current,
  total,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
}: CellPagerProps) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <View style={styles.pagerRow}>
      <Text style={styles.pagerLabel}>{label}</Text>
      <View style={styles.pagerControls}>
        <TouchableOpacity
          style={[styles.pagerArrow, !hasPrev && styles.pagerArrowDisabled]}
          onPress={onPrev}
          disabled={!hasPrev}
        >
          <MaterialIcons
            name={prevIcon as any}
            size={22}
            color={hasPrev ? colors.primary : colors.textMuted}
          />
        </TouchableOpacity>
        <Text style={styles.pagerText}>
          {current} / {total}
        </Text>
        <TouchableOpacity
          style={[styles.pagerArrow, !hasNext && styles.pagerArrowDisabled]}
          onPress={onNext}
          disabled={!hasNext}
        >
          <MaterialIcons
            name={nextIcon as any}
            size={22}
            color={hasNext ? colors.primary : colors.textMuted}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const getStyles = createStyles((colors) => ({
  pagerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pagerLabel: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: "500",
  },
  pagerControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  pagerArrow: {
    padding: 2,
    borderRadius: 20,
  },
  pagerArrowDisabled: {
    opacity: 0.4,
  },
  pagerText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "500",
    minWidth: 48,
    textAlign: "center",
  },
}));
