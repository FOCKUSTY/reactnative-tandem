import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRecords, useDeleteRecord } from '../hooks/useRecords';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Section, MyRecord } from '../types';
import Markdown from 'react-native-markdown-renderer';

type RouteParams = {
  id: number;
  section: Section;
};

export default function RecordDetailScreen() {
  const route = useRoute();
  const { id, section } = route.params as RouteParams;
  const navigation = useNavigation();
  const { data: records = [] } = useRecords(section);
  const record = records.find((r: MyRecord) => r.id === id);
  const deleteMutation = useDeleteRecord();

  if (!record) return <Text>Запись не найдена</Text>;

  const handleDelete = () => {
    Alert.alert('Удалить?', 'Вы уверены?', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: async () => {
          await deleteMutation.mutateAsync(id);
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{record.title || 'Без заголовка'}</Text>
      {record.dateEvent && (
        <Text style={styles.date}>{new Date(record.dateEvent).toLocaleDateString()}</Text>
      )}
      <Markdown style={markdownStyles}>{record.content || ""}</Markdown>
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.editButton]}
          onPress={() => navigation.navigate('CreateRecord', { section, record })}
        >
          <Text style={styles.buttonText}>Редактировать</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={handleDelete}>
          <Text style={styles.buttonText}>Удалить</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 6 },
  date: { color: '#888', marginBottom: 12 },
  actions: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 20 },
  button: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8 },
  editButton: { backgroundColor: '#007AFF' },
  deleteButton: { backgroundColor: '#FF3B30' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});

const markdownStyles = {
  body: { fontSize: 16, lineHeight: 24 },
  blockquote: { backgroundColor: '#f0f0f0', padding: 10, borderRadius: 4 },
};