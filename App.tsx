import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Icon from 'react-native-vector-icons/Feather';

import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import SectionsScreen from './src/screens/SectionsScreen';
import RecordsListScreen from './src/screens/RecordsListScreen';
import RecordDetailScreen from './src/screens/RecordDetailScreen';
import CreateRecordScreen from './src/screens/CreateRecordScreen';
import { Section } from './src/types';

export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
  Records: { section: Section; title: string };
  RecordDetail: { id: number; section: Section };
  CreateRecord: { section: Section; record?: any };
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();
const queryClient = new QueryClient();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: string;
          if (route.name === 'Главная') iconName = 'home';
          else if (route.name === 'Разделы') iconName = 'grid';
          else if (route.name === 'Настройки') iconName = 'settings';
          else iconName = 'circle';
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
      })}
    >
      <Tab.Screen name="Главная" component={HomeScreen} />
      <Tab.Screen name="Разделы" component={SectionsScreen} />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  return (
    <Stack.Navigator>
      {!user ? (
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      ) : (
        <>
          <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
          <Stack.Screen
            name="Records"
            component={RecordsListScreen}
            options={({ route }) => ({ title: route.params?.title || 'Записи' })}
          />
          <Stack.Screen name="RecordDetail" component={RecordDetailScreen} options={{ title: 'Запись' }} />
          <Stack.Screen name="CreateRecord" component={CreateRecordScreen} options={{ title: 'Новая запись' }} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </AuthProvider>
    </QueryClientProvider>
  );
}