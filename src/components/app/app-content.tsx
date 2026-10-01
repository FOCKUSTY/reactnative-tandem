import { View } from "react-native";
import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { I18nextProvider } from "react-i18next";
import { NavigationContainer } from "@react-navigation/native";

import { usePin } from "../../contexts/pin.context";
import { i18n } from "../../i18n";
import {
  ThemeProvider,
  AuthProvider,
  FiltersProvider,
  ReminderProvider,
} from "../../contexts";
import { PinScreen } from "../../screens";
import { AppNavigator } from "./app-navigator";
import { StatusWidget } from "../status-widget.component";
import { usePushNotifications } from "../../hooks/use-push-notifications.hook";

interface AppContentProps {
  queryClient: QueryClient;
}

const PushNotificationsGate = () => {
  usePushNotifications();
  return null;
};

export const AppContent = ({ queryClient }: AppContentProps) => {
  const { isPinEnabled, checkPin } = usePin();
  const [isPinVerified, setIsPinVerified] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const enabled = await checkPin();
      if (!enabled) {
        setIsPinVerified(true);
      }
      setLoading(false);
    };
    init();
  }, []);

  if (loading) return null;

  if (isPinEnabled && !isPinVerified) {
    return (
      <I18nextProvider i18n={i18n}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <AuthProvider>
              <PinScreen onSuccess={() => setIsPinVerified(true)} />
            </AuthProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </I18nextProvider>
    );
  }

  return (
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <View style={{ flex: 1 }}>
            <StatusWidget />
            <AuthProvider>
              <PushNotificationsGate />
              <FiltersProvider>
                <ReminderProvider>
                  <NavigationContainer>
                    <AppNavigator />
                  </NavigationContainer>
                </ReminderProvider>
              </FiltersProvider>
            </AuthProvider>
          </View>
        </ThemeProvider>
      </QueryClientProvider>
    </I18nextProvider>
  );
};
