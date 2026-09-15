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
          if (route.name === t("home.title")) iconName = "home";
          else if (route.name === t("sections.title")) iconName = "menu";
          else if (route.name === t("settings.title")) iconName = "settings";
          else if (route.name === t("tables.title")) iconName = "table-rows";
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
        name={t("tables.title")}
        component={TablesScreen}
        options={{ title: t("tables.title") }}
      />
      <Tab.Screen
        name={t("settings.title")}
        component={SettingsScreen}
        options={{ title: t("settings.title") }}
      />
    </Tab.Navigator>
  );
};
