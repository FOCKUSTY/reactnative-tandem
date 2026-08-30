import { View, Text, StyleSheet } from "react-native";
import { useNetInfo } from "@react-native-community/netinfo";
import { useTheme } from "../contexts";

export const OfflineBanner = () => {
  const netInfo = useNetInfo();
  const { colors } = useTheme();

  if (netInfo.isConnected !== false) return null;

  return (
    <View style={[styles.banner, { backgroundColor: colors.danger }]}>
      <Text style={styles.text}>Нет подключения к интернету</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: { padding: 8, alignItems: "center" },
  text: { color: "#fff", fontWeight: "600" },
});
