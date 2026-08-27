import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useTheme } from "../../contexts";
import { createStyles } from "../../utils";

export type PartnerFormProperties = {
  username: string;
  setUsername: (text: string) => void;
  loading: boolean;
  onSubmit: () => void;
};

export const PartnerForm = ({
  username,
  setUsername,
  loading,
  onSubmit,
}: PartnerFormProperties) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <View>
      <Text style={styles.description}>
        Введите имя пользователя вашей второй половинки, чтобы видеть общие
        записи.
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Имя пользователя"
        placeholderTextColor={colors.textMuted}
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={onSubmit}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Привязка..." : "Привязать"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const getStyles = createStyles((colors) => ({
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 22,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.inputBackground,
    color: colors.text,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
}));
