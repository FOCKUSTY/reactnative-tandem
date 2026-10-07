import { useState } from "react";
import { Modal, Text, TouchableOpacity, Pressable } from "react-native";
import { MaterialIcons } from "@react-native-vector-icons/material-icons";

import { useTheme } from "../../contexts";
import { createStyles } from "../../utils";
import { useTranslate } from "../../hooks";

export type OverflowMenuAction = {
  label: string;
  onPress: () => void;
  destructive?: boolean;
};

export type OverflowMenuProps = {
  actions: OverflowMenuAction[];
  accessibilityLabel?: string;
  iconSize?: number;
};

/**
 * Три точки в шапке, за которыми прячутся вторичные действия.
 *
 * Не используем Alert.alert с кнопками: на Android нативный диалог принимает
 * максимум 3 кнопки, и всё, что сверх, молча отбрасывается. Свой Modal
 * снимает лимит и даёт одинаковый вид на iOS и Android.
 *
 * Действие вызывается после закрытия модалки: если внутри будет Alert
 * (например, подтверждение удаления), он отрисуется поверх уже закрытого
 * меню — иначе на Android окажется под ним.
 */
export const OverflowMenu = ({
  actions,
  accessibilityLabel,
  iconSize = 22,
}: OverflowMenuProps) => {
  const { colors } = useTheme();
  const { t } = useTranslate();
  const styles = getStyles(colors);
  const [visible, setVisible] = useState(false);

  const handlePress = (action: OverflowMenuAction) => {
    setVisible(false);
    setTimeout(() => action.onPress(), 150);
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => setVisible(true)}
        style={styles.trigger}
        accessibilityLabel={accessibilityLabel ?? t("common.more")}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <MaterialIcons
          name="more-vert"
          size={iconSize}
          color={colors.primary}
        />
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setVisible(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            {actions.map((action, index) => (
              <TouchableOpacity
                key={`${action.label}-${index}`}
                style={styles.item}
                onPress={() => handlePress(action)}
                activeOpacity={0.6}
              >
                <Text
                  style={[
                    styles.itemText,
                    action.destructive && styles.itemTextDestructive,
                  ]}
                >
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.item, styles.cancelItem]}
              onPress={() => setVisible(false)}
              activeOpacity={0.6}
            >
              <Text style={styles.cancelText}>{t("common.cancel")}</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

const getStyles = createStyles((colors) => ({
  trigger: {
    padding: 6,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  sheet: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: "hidden",
  },
  item: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  itemText: {
    fontSize: 16,
    color: colors.text,
  },
  itemTextDestructive: {
    color: colors.danger,
  },
  cancelItem: {
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    marginTop: 4,
  },
  cancelText: {
    fontSize: 16,
    color: colors.textMuted,
    textAlign: "center",
  },
}));
