import { View, Text } from "react-native";
import { LinkedPartnerInfo, PartnerForm } from "../components";
import { useLinkPartner } from "../hooks";
import { createStyles } from "../utils";
import { useTheme } from "../contexts";
import { useTranslate } from "../hooks";

export const LinkPartnerScreen = () => {
  const { t } = useTranslate();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const {
    partner,
    partnerUsername,
    setPartnerUsername,
    loading,
    handleLink,
    isLinked,
  } = useLinkPartner();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("settings.linkPartnerTitle")}</Text>
      {isLinked ? (
        <LinkedPartnerInfo partner={partner} />
      ) : (
        <PartnerForm
          username={partnerUsername}
          setUsername={setPartnerUsername}
          loading={loading}
          onSubmit={handleLink}
        />
      )}
    </View>
  );
};

const getStyles = createStyles((colors) => ({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 20,
  },
}));

export default LinkPartnerScreen;
