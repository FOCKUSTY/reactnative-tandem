import DateTimePicker from "@react-native-community/datetimepicker";
import { MaterialIcons } from "@react-native-vector-icons/material-icons";
import { View, Text, TouchableOpacity } from "react-native";

import { createStyles } from "../utils";
import { useTheme } from "../contexts";

export type DatePickerProperties = {
  date: Date | null;
  visible: boolean;
  onShow: () => void;
  onHide: () => void;
  onDateChange: (date?: Date) => void;
};

export const DatePickerComponent = ({
  date,
  visible,
  onShow,
  onHide,
  onDateChange,
}: DatePickerProperties) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <View>
      <TouchableOpacity style={styles.dateButton} onPress={onShow}>
        <MaterialIcons name="event" size={20} color={colors.primary} />
        <Text style={styles.dateButtonText}>
          {date ? date.toLocaleDateString() : "Выберите дату"}
        </Text>
      </TouchableOpacity>
      {visible && (
        <DateTimePicker
          value={date || new Date()}
          mode="date"
          display="default"
          onValueChange={(_, selectedDate) => {
            onDateChange(selectedDate);
          }}
          onDismiss={() => {
            onHide();
          }}
        />
      )}
    </View>
  );
};

const getStyles = createStyles((colors) => ({
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.inputBackground,
    padding: 12,
    borderRadius: 8,
  },
  dateButtonText: {
    color: colors.text,
    fontSize: 16,
    marginLeft: 8,
  },
}));
