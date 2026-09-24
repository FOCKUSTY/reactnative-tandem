import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  MaterialIcons,
  MaterialIconsIconName,
} from "@react-native-vector-icons/material-icons";
import { useTheme } from "../../contexts/theme.context";
import { useTranslate } from "../../hooks/i18n/use-translation.hook";
import {
  HomeScreen,
  SectionsScreen,
  SettingsScreen,
  TablesScreen,
} from "../../screens";

const Tab = createBottomTabNavigator();

export const MainTabs = () => {
  const { colors } = useTheme();
  const { t } = useTranslate();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: MaterialIconsIconName;
          if (route.name === "HOME") iconName = "home";
          else if (route.name === "SECTIONS") iconName = "menu";
          else if (route.name === "SETTINGS") iconName = "settings";
          else if (route.name === "TABLES") iconName = "table-rows";
          else if (route.name === "FILTERS") iconName = "filter-list-alt";
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
        name={"HOME"}
        component={HomeScreen}
        options={{ title: t("home.title") }}
      />
      <Tab.Screen
        name={"SECTIONS"}
        component={SectionsScreen}
        options={{ title: t("sections.title") }}
      />
      <Tab.Screen
        name={"TABLES"}
        component={TablesScreen}
        options={{ title: t("tables.title") }}
      />
      <Tab.Screen
        name={"SETTINGS"}
        component={SettingsScreen}
        options={{ title: t("settings.title") }}
      />
    </Tab.Navigator>
  );
};
