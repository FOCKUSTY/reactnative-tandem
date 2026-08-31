import { View } from "react-native";
import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { I18nextProvider } from "react-i18next";
import { NavigationContainer } from "@react-navigation/native";

import { usePin } from "../../contexts/pin.context";
import { i18n } from "../../i18n";
import { ThemeProvider, AuthProvider, FiltersProvider } from "../../contexts";
import { PinScreen } from "../../screens";
import { AppNavigator } from "./app-navigator";
import { StatusWidget } from "../status-widget.component";

interface AppContentProps {
  queryClient: QueryClient;
}

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
              <FiltersProvider>
                <NavigationContainer>
                  <AppNavigator />
                </NavigationContainer>
              </FiltersProvider>
            </AuthProvider>
          </View>
        </ThemeProvider>
      </QueryClientProvider>
    </I18nextProvider>
  );
};
