import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Switch, ScrollView, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useCreateRecord, useUpdateRecord } from '../hooks/useRecords';
import { useRoute, useNavigation } from '@react-navigation/native';
import { MyRecord, Section } from '../types';

type RouteParams = {
  section: Section;
  record?: MyRecord;
};

export default function CreateRecordScreen() {
  const route = useRoute();
  const { section, record } = route.params as RouteParams;
  const navigation = useNavigation();
  const isEditing = !!record;

  const [title, setTitle] = useState(record?.title || '');
  const [content, setContent] = useState(record?.content || '');
  const [dateEvent, setDateEvent] = useState<Date | null>(record?.dateEvent ? new Date(record.dateEvent) : null);
  const [isCompleted, setIsCompleted] = useState(record?.isCompleted || false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const createMutation = useCreateRecord();
  const updateMutation = useUpdateRecord();

  const handleSave = async () => {
    const data = {
      section,
      title,
      content,
      dateEvent: dateEvent?.toISOString(),
      isPinned: false,
      isCompleted,
      tags: [],
      metadata: {},
    };

    try {
      if (isEditing && record) {
        await updateMutation.mutateAsync({ id: record.id, section, data });
      } else {
        await createMutation.mutateAsync(data);
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось сохранить');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <TextInput style={styles.input} placeholder="Заголовок" value={title} onChangeText={setTitle} />
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Содержание (Markdown)"
        value={content}
        onChangeText={setContent}
        multiline
        numberOfLines={6}
      />

      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
        <Text>{dateEvent ? dateEvent.toLocaleDateString() : 'Выбрать дату'}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={dateEvent || new Date()}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) setDateEvent(selectedDate);
          }}
        />
      )}

      {section === 'plans' && (
        <View style={styles.switchRow}>
          <Text>Выполнено</Text>
          <Switch value={isCompleted} onValueChange={setIsCompleted} />
        </View>
      )}

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>{isEditing ? 'Обновить' : 'Создать'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 8, marginBottom: 12 },
  textArea: { height: 120, textAlignVertical: 'top' },
  dateButton: { borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8, marginBottom: 12 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  saveButton: { backgroundColor: '#007AFF', padding: 14, borderRadius: 8 },
  saveButtonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
});