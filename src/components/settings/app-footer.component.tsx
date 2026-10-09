import { View, Text, TouchableOpacity, Alert } from "react-native";
import Toast from "react-native-toast-message";

import { createStyles } from "../../utils";
import { useTheme } from "../../contexts";
import { useDeveloperMode } from "../../contexts/developer-mode.context";
import { useTranslate } from "../../hooks";
import { NAME, VERSION } from "../../constants";

export const AppFooter = () => {
  const { colors } = useTheme();
  const { t } = useTranslate();
  const styles = getStyles(colors);
  const { isDeveloperMode, setDeveloperMode } = useDeveloperMode();

  const handleLongPress = () => {
    if (!isDeveloperMode) {
      void setDeveloperMode(true);
      Toast.show({
        type: "success",
        text1: t("developerMode.enabled"),
        text2: t("developerMode.enabledHint"),
        position: "bottom",
        visibilityTime: 3000,
      });
      return;
    }

    Alert.alert(
      t("developerMode.disableTitle"),
      t("developerMode.disableMessage"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.confirm"),
          style: "destructive",
          onPress: () => {
            void setDeveloperMode(false);
          },
        },
      ],
    );
  };

  return (
    <View style={styles.footer}>
      <TouchableOpacity
        onLongPress={handleLongPress}
        delayLongPress={1200}
        activeOpacity={0.7}
        hitSlop={{ top: 12, bottom: 12, left: 24, right: 24 }}
      >
        <Text style={styles.footerText}>
          {NAME} {VERSION}
          {isDeveloperMode ? "  •  DEV" : ""}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const getStyles = createStyles((colors) => ({
  footer: {
    marginTop: 24,
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: colors.textMuted,
  },
}));
