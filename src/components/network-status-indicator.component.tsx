import MaterialIcons from "@react-native-vector-icons/material-icons";
import { useNetInfo } from "@react-native-community/netinfo";

import { Widget } from "./widget.component";
import { useTheme } from "../contexts";
import { useTranslate } from "../hooks";

export const NetworkStatusIndicator = () => {
  const { colors } = useTheme();
  const netInfo = useNetInfo();

  const { t } = useTranslate();

  if (netInfo.isConnected !== false) return null;

  return (
    <Widget label={t("network.offline")}>
      <MaterialIcons name="wifi-off" size={24} color={colors.danger} />
    </Widget>
  );
};
