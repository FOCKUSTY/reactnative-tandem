import DateTimePicker from "@react-native-community/datetimepicker";
import { View, Text, TouchableOpacity } from "react-native";
import { useState } from "react";
import { useTheme } from "../../contexts";
import { createStyles } from "../../utils";

export type DateRangePickerProperties = {
  dateFrom: Date | null;
  dateTo: Date | null;
  onDateFromChange: (date: Date) => void;
  onDateToChange: (date: Date) => void;
  onClear?: () => void;
};

export const DateRangePicker = ({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
}: DateRangePickerProperties) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [showFrom, setShowFrom] = useState(false);
  const [showTo, setShowTo] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Дата события</Text>
      <View style={styles.row}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setShowFrom(true)}
        >
          <Text style={styles.buttonText}>
            {dateFrom ? dateFrom.toLocaleDateString() : "От"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => setShowTo(true)}>
          <Text style={styles.buttonText}>
            {dateTo ? dateTo.toLocaleDateString() : "До"}
          </Text>
        </TouchableOpacity>
      </View>
      {showFrom && (
        <DateTimePicker
          value={dateFrom || new Date()}
          mode="date"
          display="default"
          onValueChange={(_, date) => {
            setShowFrom(false);
            if (date) onDateFromChange(date);
          }}
          onDismiss={() => setShowFrom(false)}
        />
      )}
      {showTo && (
        <DateTimePicker
          value={dateTo || new Date()}
          mode="date"
          display="default"
          onValueChange={(_, date) => {
            setShowTo(false);
            if (date) onDateToChange(date);
          }}
          onDismiss={() => setShowTo(false)}
        />
      )}
    </View>
  );
};

const getStyles = createStyles((colors) => ({
  container: {
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    gap: 8,
  },
  button: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.inputBackground,
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: colors.text,
    fontSize: 14,
  },
}));
