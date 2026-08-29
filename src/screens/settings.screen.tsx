import { ScrollView } from "react-native";
import { createStyles } from "../utils";
import { useSettings } from "../hooks";
import { useTheme } from "../contexts";
import {
  ProfileSection,
  PartnerSection,
  AppearanceSection,
  AboutSection,
  LogoutButton,
  AppFooter,
  LanguageSection,
  LoggingSection,
  PinSection,
} from "../components";

export const SettingsScreen = () => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { user, mode, toggleTheme, handleLogout, isPartnerLinked } =
    useSettings();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ProfileSection user={user} />
      <PartnerSection isPartnerLinked={isPartnerLinked} />
      <AppearanceSection mode={mode} onToggleTheme={toggleTheme} />
      <LanguageSection />
      <AboutSection />
      <LoggingSection />
      <PinSection />
      <LogoutButton onPress={handleLogout} />
      <AppFooter />
    </ScrollView>
  );
};

const getStyles = createStyles(() => ({
  content: {
    padding: 16,
    paddingBottom: 40,
  },
}));

export default SettingsScreen;
