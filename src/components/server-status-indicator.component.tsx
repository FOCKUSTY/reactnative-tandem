import MaterialIcons from "@react-native-vector-icons/material-icons";
import { useServerStatus } from "../hooks/use-server-status.hook";
import { Widget } from "./widget.component";
import { useTheme } from "../contexts";

export const ServerStatusIndicator = () => {
  const { colors } = useTheme();
  const { isServerAvailable } = useServerStatus();

  if (isServerAvailable) return null;

  return (
    <Widget label="Сервер недоступен">
      <MaterialIcons name="cloud-off" size={24} color={colors.danger} />
    </Widget>
  );
};
