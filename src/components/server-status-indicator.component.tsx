import MaterialIcons from "@react-native-vector-icons/material-icons";
import { useServerStatus } from "../hooks/use-server-status.hook";
import { Widget } from "./widget.component";
import { useTheme } from "../contexts";
import { useTranslate } from "../hooks";

export const ServerStatusIndicator = () => {
  const { colors } = useTheme();
  const { isServerAvailable } = useServerStatus();
  const { t } = useTranslate();

  if (isServerAvailable) return null;

  return (
    <Widget label={t("errors.serverUnavailable")}>
      <MaterialIcons name="cloud-off" size={24} color={colors.danger} />
    </Widget>
  );
};
