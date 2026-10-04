import { useState, useRef, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { useAuth, usePin, useTheme } from "../contexts";
import { createStyles } from "../utils";
import { useTranslate } from "../hooks";

export type PinProperties = {
  onSuccess?: () => void;
};

export const PinScreen = (properties: PinProperties) => {
  const { colors } = useTheme();
  const { t } = useTranslate();
  const styles = getStyles(colors);
  const { verifyPin, removePin, lockedUntil } = usePin();
  const { logout } = useAuth();

  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<TextInput>(null);

  const [now, setNow] = useState(Date.now());
  const isLocked = lockedUntil !== null && lockedUntil > now;

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 300);
  }, []);

  useEffect(() => {
    if (!isLocked) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [isLocked]);

  const lockedMinutes =
    isLocked && lockedUntil ? Math.ceil((lockedUntil - now) / 60000) : 0;

  const handleSubmit = async () => {
    if (isLocked) return;
    if (pin.length < 4) {
      setError(t("pin.errorMinLength"));
      return;
    }
    const isValid = await verifyPin(pin);
    if (isValid) {
      properties.onSuccess?.();
    } else {
      setError(t("pin.errorInvalid"));
      setPin("");
      inputRef.current?.focus();
    }
  };

  const handleLogout = () => {
    Alert.alert(t("pin.logoutTitle"), t("pin.logoutMessage"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("settings.logout"),
        style: "destructive",
        onPress: async () => {
          await logout();
          await removePin();
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("pin.title")}</Text>
      <Text style={styles.subtitle}>{t("pin.subtitle")}</Text>
      <TextInput
        ref={inputRef}
        style={styles.input}
        secureTextEntry
        keyboardType="number-pad"
        maxLength={6}
        value={pin}
        onChangeText={(text) => {
          setPin(text);
          setError("");
        }}
        placeholder={t("pin.placeholder")}
        placeholderTextColor={colors.textMuted}
        onSubmitEditing={handleSubmit}
        editable={!isLocked}
      />
      {isLocked ? (
        <Text style={styles.error}>
          {t("pin.locked", { minutes: lockedMinutes })}
        </Text>
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : null}
      <TouchableOpacity
        style={styles.button}
        onPress={handleSubmit}
        disabled={isLocked}
      >
        <Text style={styles.buttonText}>{t("pin.unlock")}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleLogout} style={styles.logoutLink}>
        <Text style={styles.logoutText}>{t("pin.forgot")}</Text>
      </TouchableOpacity>
    </View>
  );
};

const getStyles = createStyles((colors) => ({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 30,
  },
  input: {
    width: "80%",
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.inputBackground,
    color: colors.text,
    padding: 14,
    borderRadius: 8,
    fontSize: 20,
    textAlign: "center",
    letterSpacing: 8,
  },
  error: {
    color: colors.danger,
    marginTop: 12,
    fontSize: 14,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginTop: 20,
    width: "80%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  logoutLink: {
    marginTop: 20,
  },
  logoutText: {
    color: colors.textMuted,
    fontSize: 14,
    textDecorationLine: "underline",
  },
}));
