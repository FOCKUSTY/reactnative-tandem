import { MaterialIcons } from "@react-native-vector-icons/material-icons";
import { View, Text } from "react-native";
import { useTheme } from "../contexts";
import { createStyles } from "../utils";

export type RecordHeaderProperties = {
  title?: string;
  date?: string;
  time?: string;
};

export const RecordHeader = ({ title, date, time }: RecordHeaderProperties) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <View>
      {title && <Text style={styles.title}>{title}</Text>}
      {date && (
        <View style={styles.dateContainer}>
          <MaterialIcons name="event" size={20} color={colors.primary} />
          <Text style={styles.dateText}>
            {date} {time ? `в ${time}` : ""}
          </Text>
        </View>
      )}
    </View>
  );
};

const getStyles = createStyles((colors) => ({
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 12,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  dateText: {
    fontSize: 16,
    color: colors.primary,
    marginLeft: 8,
  },
}));
