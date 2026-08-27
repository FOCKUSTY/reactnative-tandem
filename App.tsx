import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  MaterialIcons,
  MaterialIconsIconName,
} from "@react-native-vector-icons/material-icons";

import { AuthProvider, useAuth } from "./src/contexts/AuthContext";
import { ThemeProvider, useTheme } from "./src/contexts/ThemeContext";
import LoginScreen from "./src/screens/LoginScreen";
import HomeScreen from "./src/screens/HomeScreen";

import LinkPartnerScreen from "./src/screens/LinkPartnerScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import { MyRecord } from "./src/types";
import SectionsScreen from "./src/screens/SectionsScreen";
import RecordsScreen from "./src/screens/RecordsScreen";
import RecordDetail from "./src/screens/RecordDetail";
import CreateRecordScreen from "./src/screens/CreateRecordScreen";
import { FiltersProvider } from "./src/contexts/FiltersContext";
import FiltersScreen from "./src/screens/FiltersScreen";
import FilterScreen from "./src/screens/FilterScreen";

export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
  Filters: undefined;
  Filter: undefined;
  Records: { sectionId: string; title: string };
  RecordDetail: { id: string };
  CreateRecord: { sectionId: string; record?: MyRecord };
  LinkPartner: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();
const queryClient = new QueryClient();

function MainTabs() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: MaterialIconsIconName;
          if (route.name === "Tandem") iconName = "home";
          else if (route.name === "Разделы") iconName = "menu";
          else if (route.name === "Настройки") iconName = "settings";
          else if (route.name === "Фильтр") iconName = "filter-list-alt";
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
      <Tab.Screen name="Tandem" component={HomeScreen} />
      <Tab.Screen name="Разделы" component={SectionsScreen} />
      <Tab.Screen name="Фильтр" component={FilterScreen} />
      <Tab.Screen name="Настройки" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { user, isLoading } = useAuth();
  const { colors } = useTheme();

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
            name="Filters"
            component={FiltersScreen}
            options={{ title: "Фильтры" }}
          />
          <Stack.Screen
            name="Main"
            component={MainTabs}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="LinkPartner"
            component={LinkPartnerScreen}
            options={{ title: "Привязка партнёра" }}
          />
          <Stack.Screen
            name="CreateRecord"
            component={CreateRecordScreen}
            options={({ route }) => ({
              title: (route.params as { record?: MyRecord })?.record
                ? "Редактировать запись"
                : "Создать запись",
            })}
          />
          <Stack.Screen
            name="Records"
            component={RecordsScreen}
            options={({ route }) => ({
              title: (route.params as { title: string })?.title || "Записи",
            })}
          />
          <Stack.Screen
            name="RecordDetail"
            component={RecordDetail}
            options={{ title: "Запись" }}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ title: "Настройки" }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
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
  );
}
