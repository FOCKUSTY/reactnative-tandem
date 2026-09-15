import type { MyRecord, RootStackParameters } from "../../types";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../../contexts/auth.context";
import { useTheme } from "../../contexts/theme.context";
import { useTranslate } from "../../hooks/i18n/use-translation.hook";
import {
  LoginScreen,
  LinkPartnerScreen,
  SettingsScreen,
  RecordsScreen,
  RecordDetailsScreen,
  SectionsScreen,
  CreateRecordScreen,
  LogsScreen,
  CalendarScreen,
  PinScreen,
  RemindersScreen,
  StarredScreen,
  TablesScreen,
  CreateTableScreen,
  TableDetailScreen,
  CellScreen,
} from "../../screens";
import { MainTabs } from "./main-tabs";

const Stack = createNativeStackNavigator<RootStackParameters>();

export const AppNavigator = () => {
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
            name="Tables"
            component={TablesScreen}
            options={{ title: t("tables.title") }}
          />
          <Stack.Screen
            name="CreateTable"
            component={CreateTableScreen}
            options={({ route }) => ({
              title: route.params.table
                ? t("tables.editTitle")
                : t("tables.createTitle"),
            })}
          />
          <Stack.Screen
            name="TableDetail"
            component={TableDetailScreen}
            options={({ route }) => ({
              title: route.params.tableName || t("tables.title"),
            })}
          />
          <Stack.Screen
            name="CellScreen"
            component={CellScreen}
            options={{ title: "" }}
          />
          <Stack.Screen
            name="Logs"
            component={LogsScreen}
            options={{ title: t("logs.title") }}
          />
          <Stack.Screen
            name="Sections"
            component={SectionsScreen}
            options={{ title: t("logs.title") }}
          />
          <Stack.Screen
            name="Starred"
            component={StarredScreen}
            options={{ title: t("logs.title") }}
          />
          <Stack.Screen
            name="Reminders"
            component={RemindersScreen}
            options={{ title: t("reminders.title") }}
          />
          <Stack.Screen
            name="LinkPartner"
            component={LinkPartnerScreen}
            options={{ title: t("settings.linkPartner") }}
          />
          <Stack.Screen
            name="Calendar"
            component={CalendarScreen}
            options={{ title: t("calendar.title") }}
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
          <Stack.Screen name="Pin" component={PinScreen} />
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
