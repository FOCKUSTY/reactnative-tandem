import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRecords } from '../hooks/useRecords';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MyRecord, Section } from '../types';

type RootStackParamList = {
  RecordDetail: { id: number; section: Section };
  CreateRecord: { section: Section };
};

type RouteParams = {
  section: Section;
  title: string;
};

export default function RecordsListScreen() {
  const route = useRoute();
  const { section, title } = route.params as RouteParams;
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { data: records = [], isLoading, refetch } = useRecords(section);

  if (isLoading) return <ActivityIndicator size="large" style={styles.loader} />;

  return (
    <View style={styles.container}>
      <FlatList
        data={records}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }: { item: MyRecord }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('RecordDetail', { id: item.id, section })}
          >
            <Text style={styles.title}>{item.title || 'Без заголовка'}</Text>
            <Text numberOfLines={2}>{item.content?.slice(0, 120)}</Text>
            {item.dateEvent && (
              <Text style={styles.date}>{new Date(item.dateEvent).toLocaleDateString()}</Text>
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Нет записей</Text>}
        onRefresh={refetch}
        refreshing={isLoading}
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateRecord', { section })}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  loader: { flex: 1, justifyContent: 'center' },
  card: { padding: 16, backgroundColor: '#f9f9f9', borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: '#eee' },
  title: { fontWeight: 'bold', fontSize: 16, marginBottom: 4 },
  date: { marginTop: 8, color: '#888', fontSize: 12 },
  empty: { textAlign: 'center', marginTop: 40, color: '#aaa' },
  fab: { position: 'absolute', bottom: 30, right: 30, backgroundColor: '#007AFF', width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 4 },
  fabText: { color: '#fff', fontSize: 28, fontWeight: 'bold' },
});