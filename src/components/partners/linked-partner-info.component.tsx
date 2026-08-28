import type { PairUser } from "../../types";
import { View, Text } from "react-native";
import { createStyles } from "../../utils";
import { useTheme } from "../../contexts";
import { useTranslate } from "../../hooks";

export type LinkedPartnerInfoProperties = {
  partner: PairUser | null;
};

export const LinkedPartnerInfo = ({ partner }: LinkedPartnerInfoProperties) => {
  const { colors } = useTheme();
  const { t } = useTranslate();
  const styles = getStyles(colors);

  return (
    <View style={styles.linkedContainer}>
      <Text style={styles.linkedText}>{t("settings.alreadyLinked")}</Text>
      <Text style={styles.linkedSubtext}>
        {t("settings.partnerLabel")}{" "}
        {partner?.name || partner?.username || t("settings.unknown")}
      </Text>
    </View>
  );
};

const getStyles = createStyles((colors) => ({
  linkedContainer: {
    backgroundColor: "#1E3A2A",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2E5A3A",
  },
  linkedText: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.success,
  },
  linkedSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
}));
