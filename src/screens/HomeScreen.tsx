import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRecords } from '../hooks/useRecords';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Section } from '../types';

type RootStackParamList = {
  Records: { section: Section; title: string };
  CreateRecord: { section: Section };
};

export default function HomeScreen() {
  const { user } = useAuth();
  const { data: dates = [] } = useRecords('dates');
  const { data: plans = [] } = useRecords('plans');
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const upcomingDate = dates
    .filter(d => d.dateEvent && new Date(d.dateEvent) >= new Date())
    .sort((a, b) => new Date(a.dateEvent!).getTime() - new Date(b.dateEvent!).getTime())[0];

  const incompletePlans = plans.filter(p => !p.isCompleted).length;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.greeting}>Привет, {user?.name || 'друг'}!</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Ближайшая дата</Text>
        {upcomingDate ? (
          <>
            <Text style={styles.cardDate}>
              {new Date(upcomingDate.dateEvent!).toLocaleDateString()}
            </Text>
            <Text>{upcomingDate.content?.slice(0, 100)}</Text>
          </>
        ) : (
          <Text>Нет предстоящих дат</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Планы</Text>
        <Text style={styles.cardCount}>Осталось: {incompletePlans}</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Records', { section: 'plans', title: 'Планы' })}
        >
          <Text style={styles.buttonText}>Перейти к планам</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('CreateRecord', { section: 'plans' })}
        >
          <Text>➕ Новый план</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('CreateRecord', { section: 'questions' })}
        >
          <Text>❓ Новый вопрос</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Records', { section: 'discasses', title: 'Дискасы' })}
        >
          <Text>🗣 Дискас</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  greeting: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  cardTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  cardDate: { fontSize: 16, color: '#007AFF', marginBottom: 4 },
  cardCount: { fontSize: 20, fontWeight: 'bold' },
  button: { backgroundColor: '#007AFF', padding: 12, borderRadius: 8, marginTop: 8 },
  buttonText: { color: '#fff', textAlign: 'center' },
  quickActions: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 8 },
  actionButton: { backgroundColor: '#e0e0e0', padding: 12, borderRadius: 8, flex: 1, marginHorizontal: 4, alignItems: 'center' },
});