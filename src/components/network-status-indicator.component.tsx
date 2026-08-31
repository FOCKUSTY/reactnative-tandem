import MaterialIcons from "@react-native-vector-icons/material-icons";
import { useNetInfo } from "@react-native-community/netinfo";

import { Widget } from "./widget.component";
import { useTheme } from "../contexts";

export const NetworkStatusIndicator = () => {
  const { colors } = useTheme();
  const netInfo = useNetInfo();

  if (netInfo.isConnected !== false) return null;

  return (
    <Widget label="Нет интернета">
      <MaterialIcons name="wifi-off" size={24} color={colors.danger} />
    </Widget>
  );
};
