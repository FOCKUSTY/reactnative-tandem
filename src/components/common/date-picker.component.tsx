import { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { MaterialIcons } from "@react-native-vector-icons/material-icons";
import { createStyles, formatDate, formatTime } from "../../utils";
import { useTheme } from "../../contexts";
import { useTranslate } from "../../hooks";

export type DatePickerProperties = {
  date: Date | null;
  onDateChange: (date?: Date) => void;
};

export const DatePickerComponent = ({
  date,
  onDateChange,
}: DatePickerProperties) => {
  const { colors } = useTheme();
  const { t } = useTranslate();
  const styles = getStyles(colors);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleDateChange = (selectedDate: Date) => {
    const newDate = date ? new Date(date) : new Date();
    newDate.setFullYear(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
    );
    newDate.setSeconds(0, 0);
    onDateChange(newDate);

    setShowDatePicker(false);
  };

  const handleTimeChange = (selectedTime: Date) => {
    const newDate = date ? new Date(date) : new Date();
    newDate.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0, 0);
    onDateChange(newDate);

    setShowTimePicker(false);
  };

  return (
    <View>
      <View style={styles.row}>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <MaterialIcons name="event" size={20} color={colors.primary} />
          <Text style={styles.dateButtonText}>
            {date ? formatDate(date) : t("common.selectDate")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowTimePicker(true)}
        >
          <MaterialIcons name="access-time" size={20} color={colors.primary} />
          <Text style={styles.dateButtonText}>
            {date ? formatTime(date) : t("common.selectTime")}
          </Text>
        </TouchableOpacity>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={date || new Date()}
          mode="date"
          display="default"
          onValueChange={(_, date) => {
            handleDateChange(date);
          }}
          onDismiss={() => setShowDatePicker(false)}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={date || new Date()}
          mode="time"
          display="default"
          onValueChange={(_, time) => {
            handleTimeChange(time);
          }}
          onDismiss={() => setShowTimePicker(false)}
        />
      )}
    </View>
  );
};

const getStyles = createStyles((colors) => ({
  row: {
    flexDirection: "row",
    gap: 8,
  },
  dateButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.inputBackground,
    padding: 12,
    borderRadius: 8,
    justifyContent: "center",
  },
  dateButtonText: {
    color: colors.text,
    fontSize: 16,
    marginLeft: 8,
  },
}));
