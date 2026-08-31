import { View } from "react-native";

import { ServerStatusIndicator } from "./server-status-indicator.component";
import { SyncStatusIndicator } from "./sync-status-indicator.component";
import { NetworkStatusIndicator } from "./network-status-indicator.component";

export const StatusWidget = () => {
  return (
    <View style={{ position: "absolute", display: "flex", gap: 8 }}>
      <ServerStatusIndicator />
      <SyncStatusIndicator />
      <NetworkStatusIndicator />
    </View>
  );
};
