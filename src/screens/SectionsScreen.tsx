import { Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Section } from '../types';

type RootStackParamList = {
  Records: { section: Section; title: string };
};

const SECTIONS: { id: Section; label: string; icon: string }[] = [
  { id: 'rules', label: 'Правила', icon: 'book' },
  { id: 'dates', label: 'Даты', icon: 'calendar' },
  { id: 'plans', label: 'Планы', icon: 'check-square' },
  { id: 'notes', label: 'Замечания', icon: 'alert-circle' },
  { id: 'questions', label: 'Вопросы', icon: 'help-circle' },
  { id: 'contacts', label: 'Связь', icon: 'phone' },
  { id: 'definitions', label: 'Определения', icon: 'book-open' },
  { id: 'discasses', label: 'Дискасы', icon: 'message-circle' },
  { id: 'fanfics', label: 'Фанфики', icon: 'feather' },
];

export default function SectionsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const renderItem = ({ item }: { item: typeof SECTIONS[0] }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => navigation.navigate('Records', { section: item.id, title: item.label })}
    >
      <Icon name={item.icon} size={24} color="#007AFF" />
      <Text style={styles.label}>{item.label}</Text>
      <Icon name="chevron-right" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={SECTIONS}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 16 },
  item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderColor: '#eee' },
  label: { flex: 1, marginLeft: 16, fontSize: 16 },
});