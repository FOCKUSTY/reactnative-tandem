import MaterialIcons from "@react-native-vector-icons/material-icons";
import { useEffect, useRef } from "react";
import { Animated } from "react-native";

import { useSyncStatus } from "../hooks/use-sync-status.hook";
import { Widget } from "./widget.component";
import { useTheme } from "../contexts";
import { useTranslate } from "../hooks";

export const SyncStatusIndicator = () => {
  const { colors } = useTheme();
  const { isSyncing } = useSyncStatus();
  const { t } = useTranslate();

  const rotateAnim = useRef(new Animated.Value(0)).current;

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  useEffect(() => {
    if (isSyncing) {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ).start();
    } else {
      rotateAnim.setValue(0);
    }
  }, [isSyncing]);

  if (!isSyncing) return null;

  return (
    <Widget label={t("sync.status")}>
      <Animated.View style={{ transform: [{ rotate: spin }] }}>
        <MaterialIcons name={"sync"} size={24} color={colors.textMuted} />
      </Animated.View>
    </Widget>
  );
};
