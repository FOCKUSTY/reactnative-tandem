import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  PanResponder,
  ScrollView,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useLayoutEffect, useEffect, useRef, useState } from "react";
import { MaterialIcons } from "@react-native-vector-icons/material-icons";

import { CellContextBox } from "./cell-context-box.component";
import { CellValueDisplay } from "./cell-value-display.component";
import type { CellBaseProps } from "./cell.types";
import { useTheme } from "../../../contexts";
import { useShare, useTranslate } from "../../../hooks";
import { createStyles, storage } from "../../../utils";
import type { NavigationProperty } from "../../../types";
import { OverflowMenu } from "../../common";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const SWIPE_THRESHOLD = 80;
const MAX_VALUE_HEIGHT = Math.round(SCREEN_HEIGHT * 0.42);
const SWIPE_PREF_KEY = ".cell_swipe_enabled";

export const CellViewer = (props: CellBaseProps) => {
  const {
    table,
    field,
    rowId,
    initialValue,
    rowNumber,
    totalRows,
    hasPrevRow,
    hasNextRow,
    onPrevRow,
    onNextRow,
    fieldNumber,
    totalFields,
    hasPrevField,
    hasNextField,
    onPrevField,
    onNextField,
  } = props;

  const { t } = useTranslate();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const navigation = useNavigation<NavigationProperty>();

  const [swipeEnabled, setSwipeEnabled] = useState(false);

  const { shareCell } = useShare();
  const handleShare = () => {
    void shareCell({
      tableId: table.id,
      rowId,
      fieldId: field.id,
      tableName: table.name,
      fieldName: field.name,
      value: initialValue,
    });
  };

  useEffect(() => {
    storage.getItem(SWIPE_PREF_KEY).then((v) => {
      if (v === "false") setSwipeEnabled(false);
    });
  }, []);

  const toggleSwipe = async () => {
    const next = !swipeEnabled;
    setSwipeEnabled(next);
    await storage.setItem(SWIPE_PREF_KEY, String(next));
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: field.name,
      headerRight: () => (
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={handleShare} style={styles.headerButton}>
            <MaterialIcons name="share" size={22} color={colors.primary} />
          </TouchableOpacity>
          <OverflowMenu
            actions={[
              {
                label: swipeEnabled
                  ? t("tables.cell.enableScroll")
                  : t("tables.cell.enableSwipe"),
                onPress: toggleSwipe,
              },
            ]}
          />
        </View>
      ),
    });
  }, [navigation, field.name, field.id, swipeEnabled, colors.primary, t]);

  const goToEdit = () => {
    navigation.replace("CellScreen", {
      tableId: table.id,
      rowId,
      fieldId: field.id,
      tableName: table.name,
      mode: "edit",
    });
  };

  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  const hasPrevRowRef = useRef(hasPrevRow);
  const hasNextRowRef = useRef(hasNextRow);
  const onPrevRowRef = useRef(onPrevRow);
  const onNextRowRef = useRef(onNextRow);

  const hasPrevFieldRef = useRef(hasPrevField);
  const hasNextFieldRef = useRef(hasNextField);
  const onPrevFieldRef = useRef(onPrevField);
  const onNextFieldRef = useRef(onNextField);

  const swipeEnabledRef = useRef(swipeEnabled);

  hasPrevRowRef.current = hasPrevRow;
  hasNextRowRef.current = hasNextRow;
  onPrevRowRef.current = onPrevRow;
  onNextRowRef.current = onNextRow;

  hasPrevFieldRef.current = hasPrevField;
  hasNextFieldRef.current = hasNextField;
  onPrevFieldRef.current = onPrevField;
  onNextFieldRef.current = onNextField;

  swipeEnabledRef.current = swipeEnabled;

  useLayoutEffect(() => {
    translateX.setValue(0);
  }, [field.id, translateX]);
  useLayoutEffect(() => {
    translateY.setValue(0);
  }, [rowId, translateY]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => {
        if (!swipeEnabledRef.current) return false;

        const absX = Math.abs(g.dx);
        const absY = Math.abs(g.dy);
        if (absX < 12 && absY < 12) return false;
        return absX > absY * 1.4 || absY > absX * 1.4;
      },

      onPanResponderMove: (_, g) => {
        const absX = Math.abs(g.dx);
        const absY = Math.abs(g.dy);

        if (absX > absY) {
          if (
            (g.dx > 0 && !hasPrevFieldRef.current) ||
            (g.dx < 0 && !hasNextFieldRef.current)
          ) {
            translateX.setValue(g.dx * 0.25);
          } else {
            translateX.setValue(g.dx);
          }
        } else {
          if (
            (g.dy > 0 && !hasPrevRowRef.current) ||
            (g.dy < 0 && !hasNextRowRef.current)
          ) {
            translateY.setValue(g.dy * 0.25);
          } else {
            translateY.setValue(g.dy);
          }
        }
      },

      onPanResponderRelease: (_, g) => {
        const absX = Math.abs(g.dx);
        const absY = Math.abs(g.dy);

        if (absX > absY) {
          if (g.dx < -SWIPE_THRESHOLD && hasNextFieldRef.current) {
            Animated.timing(translateX, {
              toValue: -SCREEN_WIDTH,
              duration: 140,
              useNativeDriver: true,
            }).start(() => onNextFieldRef.current());
          } else if (g.dx > SWIPE_THRESHOLD && hasPrevFieldRef.current) {
            Animated.timing(translateX, {
              toValue: SCREEN_WIDTH,
              duration: 140,
              useNativeDriver: true,
            }).start(() => onPrevFieldRef.current());
          } else {
            Animated.spring(translateX, {
              toValue: 0,
              useNativeDriver: true,
            }).start();
          }
          translateY.setValue(0);
        } else {
          if (g.dy < -SWIPE_THRESHOLD && hasNextRowRef.current) {
            Animated.timing(translateY, {
              toValue: -SCREEN_HEIGHT,
              duration: 140,
              useNativeDriver: true,
            }).start(() => onNextRowRef.current());
          } else if (g.dy > SWIPE_THRESHOLD && hasPrevRowRef.current) {
            Animated.timing(translateY, {
              toValue: SCREEN_HEIGHT,
              duration: 140,
              useNativeDriver: true,
            }).start(() => onPrevRowRef.current());
          } else {
            Animated.spring(translateY, {
              toValue: 0,
              useNativeDriver: true,
            }).start();
          }
          translateX.setValue(0);
        }
      },
    }),
  ).current;

  const valueContent = <CellValueDisplay field={field} value={initialValue} />;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <CellContextBox
          tableName={table.name}
          field={field}
          rowNumber={rowNumber}
          totalRows={totalRows}
          hasPrevRow={hasPrevRow}
          hasNextRow={hasNextRow}
          onPrevRow={onPrevRow}
          onNextRow={onNextRow}
          fieldNumber={fieldNumber}
          totalFields={totalFields}
          hasPrevField={hasPrevField}
          hasNextField={hasNextField}
          onPrevField={onPrevField}
          onNextField={onNextField}
        />

        <Animated.View
          style={[
            styles.swipeArea,
            { transform: [{ translateX }, { translateY }] },
          ]}
          {...(swipeEnabled ? panResponder.panHandlers : {})}
        >
          <Text style={styles.label}>{t("tables.cell.value")}</Text>

          <View style={[styles.valueBox, { maxHeight: MAX_VALUE_HEIGHT }]}>
            {swipeEnabled ? (
              valueContent
            ) : (
              <ScrollView
                showsVerticalScrollIndicator
                contentContainerStyle={styles.valueScrollContent}
              >
                {valueContent}
              </ScrollView>
            )}
          </View>
        </Animated.View>

        <Text style={styles.hint}>
          {swipeEnabled
            ? t("tables.cell.swipeHint2d")
            : t("tables.cell.scrollHint")}
        </Text>

        <TouchableOpacity style={styles.primaryButton} onPress={goToEdit}>
          <MaterialIcons name="edit" size={20} color="#fff" />
          <Text style={styles.primaryButtonText}>{t("common.edit")}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.secondaryButtonText}>{t("common.close")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const getStyles = createStyles((colors) => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 16,
    paddingBottom: 24,
  },
  swipeArea: {
    flex: 1,
  },
  headerButton: {
    padding: 8,
    marginRight: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textMuted,
    textTransform: "uppercase",
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  valueBox: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    minHeight: 80,
    overflow: "hidden",
  },
  valueScrollContent: {
    paddingBottom: 4,
  },
  hint: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 12,
    marginBottom: 4,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  secondaryButton: {
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 4,
  },
  secondaryButtonText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
}));
