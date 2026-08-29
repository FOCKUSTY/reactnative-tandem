import type { MyRecord, RootStackParameters } from "./src/types";

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  MaterialIcons,
  MaterialIconsIconName,
} from "@react-native-vector-icons/material-icons";

import {
  FiltersProvider,
  ThemeProvider,
  useTheme,
  AuthProvider,
  useAuth,
} from "./src/contexts";

import {
  LoginScreen,
  HomeScreen,
  LinkPartnerScreen,
  SettingsScreen,
  RecordsScreen,
  RecordDetailsScreen,
  FilterScreen,
  SectionsScreen,
  CreateRecordScreen,
  LogsScreen,
} from "./src/screens";
import { useEffect, useState } from "react";

import { I18nextProvider } from "react-i18next";
import { i18n, initI18n } from "./src/i18n";
import { useTranslate } from "./src/hooks";
import { logger } from "./src/utils";

const Stack = createNativeStackNavigator<RootStackParameters>();
const Tab = createBottomTabNavigator();
const queryClient = new QueryClient();

if (!__DEV__) {
  ErrorUtils.setGlobalHandler((error, isFatal) => {
    logger.error("Global error", {
      error: error.message,
      stack: error.stack,
      isFatal,
    });
  });
}

const MainTabs = () => {
  const { colors } = useTheme();
  const { t } = useTranslate();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: MaterialIconsIconName;
          if (route.name === t("home.title")) iconName = "home";
          else if (route.name === t("sections.title")) iconName = "menu";
          else if (route.name === t("settings.title")) iconName = "settings";
          else if (route.name === t("filters.title"))
            iconName = "filter-list-alt";
          else iconName = "circle";
          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.cardBorder,
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: "600" },
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerTitleStyle: {
          color: colors.text,
        },
        headerTintColor: colors.primary,
        headerShadowVisible: false,
      })}
    >
      <Tab.Screen
        name={t("home.title")}
        component={HomeScreen}
        options={{ title: t("home.title") }}
      />
      <Tab.Screen
        name={t("sections.title")}
        component={SectionsScreen}
        options={{ title: t("sections.title") }}
      />
      <Tab.Screen
        name={t("filters.title")}
        component={FilterScreen}
        options={{ title: t("filters.title") }}
      />
      <Tab.Screen
        name={t("settings.title")}
        component={SettingsScreen}
        options={{ title: t("settings.title") }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { user, isLoading } = useAuth();
  const { colors } = useTheme();
  const { t } = useTranslate();

  if (isLoading) return null;

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerTitleStyle: {
          color: colors.text,
        },
        headerTintColor: colors.primary,
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      {!user ? (
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
      ) : (
        <>
          <Stack.Screen
            name="Main"
            component={MainTabs}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Logs"
            component={LogsScreen}
            options={{ title: "Логи" }}
          />
          <Stack.Screen
            name="LinkPartner"
            component={LinkPartnerScreen}
            options={{ title: t("settings.linkPartner") }}
          />
          <Stack.Screen
            name="CreateRecord"
            component={CreateRecordScreen}
            options={({ route }) => ({
              title: (route.params as { record?: MyRecord })?.record
                ? t("records.editTitle")
                : t("records.createTitle"),
            })}
          />
          <Stack.Screen
            name="Records"
            component={RecordsScreen}
            options={({ route }) => ({
              title:
                (route.params as { title: string })?.title ||
                t("records.title"),
            })}
          />
          <Stack.Screen
            name="RecordDetail"
            component={RecordDetailsScreen}
            options={{ title: t("records.details") }}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ title: t("settings.title") }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

const App = () => {
  const [isReady, setIsReady] = useState<boolean>(false);

  useEffect(() => {
    initI18n().then(() => setIsReady(true));
  }, []);

  if (!isReady) {
    return null;
  }

  return (
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <FiltersProvider>
              <NavigationContainer>
                <AppNavigator />
              </NavigationContainer>
            </FiltersProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </I18nextProvider>
  );
};

export default App;
