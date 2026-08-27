import type { NavigationProperty } from "../types";

import { View, Text, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useState, useEffect } from "react";

import { useAuth, useTheme } from "../contexts";
import { storage, createStyles } from "../utils";
import { STORAGE_KEYS } from "../constants";

export const PartnerLinkBannerComponent = () => {
  const { me } = useAuth();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const navigation = useNavigation<NavigationProperty>();
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const loadHideStatus = async () => {
      const hidden = await storage.getItem(STORAGE_KEYS.HIDE_PARTNER_BANNER);
      setHidden(hidden === "true");
    };
    loadHideStatus();
  }, []);

  if (!me || me.pair || hidden) return null;

  const handleHide = async () => {
    await storage.setItem(STORAGE_KEYS.HIDE_PARTNER_BANNER, "true");
    setHidden(true);
  };

  return (
    <View style={styles.banner}>
      <View style={styles.content}>
        <Text style={styles.title}>Привяжите вторую половинку</Text>
        <Text style={styles.description}>
          Чтобы видеть общие записи и планировать вместе, свяжите свой аккаунт с
          партнёром.
        </Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => navigation.navigate("LinkPartner")}
        >
          <Text style={styles.linkButtonText}>Привязать</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.hideButton} onPress={handleHide}>
          <Text style={styles.hideButtonText}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const getStyles = createStyles((colors) => ({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bannerBackground,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.bannerBorder,
    gap: 10,
  },
  content: {
    flex: 1,
  },
  title: {
    fontWeight: "600",
    fontSize: 15,
    color: colors.bannerText,
    marginBottom: 2,
  },
  description: {
    fontSize: 13,
    color: colors.bannerText,
    opacity: 0.8,
    lineHeight: 18,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  linkButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  linkButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },
  hideButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  hideButtonText: {
    fontSize: 16,
    color: colors.textMuted,
    fontWeight: "bold",
  },
}));

export default PartnerLinkBannerComponent;
