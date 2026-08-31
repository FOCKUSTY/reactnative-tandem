import type { ReactNode } from "react";
import { Animated, Text, TouchableOpacity } from "react-native";
import { useTheme } from "../contexts";
import { createStyles } from "../utils";

export type WidgetProperties = {
  children: ReactNode;
  label: string;
  onPress?: () => void;
};

export const Widget = ({ children, label, onPress }: WidgetProperties) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <Animated.View style={[styles.container]}>
      <TouchableOpacity
        style={[
          styles.widget,
          { backgroundColor: colors.card, borderColor: colors.cardBorder },
        ]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        {children}
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          {label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const getStyles = createStyles(() => ({
  container: {
    position: "relative",
    top: 48,
    left: 16,
    zIndex: 999,
  },
  widget: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: "500",
  },
}));
