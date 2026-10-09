import { ScrollView } from "react-native";
import { createStyles } from "../utils";
import { useSettings } from "../hooks";
import { useDeveloperMode, useTheme } from "../contexts";
import {
  ProfileSection,
  PartnerSection,
  AppearanceSection,
  AboutSection,
  LogoutButton,
  AppFooter,
  LanguageSection,
  DeveloperSection,
  NotificationsSection,
  PinSection,
  TemplateHelpSection,
} from "../components";

export const SettingsScreen = () => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { user, mode, toggleTheme, handleLogout, isPartnerLinked } =
    useSettings();
  const { isDeveloperMode } = useDeveloperMode();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ProfileSection user={user} />
      <PartnerSection isPartnerLinked={isPartnerLinked} />
      <AppearanceSection mode={mode} onToggleTheme={toggleTheme} />
      <LanguageSection />
      <AboutSection />
      <NotificationsSection />
      <PinSection />
      <TemplateHelpSection />

      {isDeveloperMode && <DeveloperSection />}

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
