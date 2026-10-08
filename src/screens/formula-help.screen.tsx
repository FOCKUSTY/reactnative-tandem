import { ScrollView, Text, View } from "react-native";

import type { TranslationInput } from "../i18n";
import { createStyles } from "../utils";
import { useTheme } from "../contexts";
import { useTranslate } from "../hooks";

/**
 * Справка по формулам — аналог TemplateHelpScreen.
 * Показывает синтаксис ссылок, список функций и коды ошибок.
 */

const FUNCTIONS: { sig: string; descKey: TranslationInput }[] = [
  { sig: "сумма(a, b, …)", descKey: "formulaHelp.functions.sum" },
  { sig: "среднее(a, b, …)", descKey: "formulaHelp.functions.avg" },
  { sig: "мин(a, b, …)", descKey: "formulaHelp.functions.min" },
  { sig: "макс(a, b, …)", descKey: "formulaHelp.functions.max" },
  { sig: "количество(a, b, …)", descKey: "formulaHelp.functions.count" },
  { sig: "счёт(a, b, …)", descKey: "formulaHelp.functions.counta" },
  { sig: "округл(x, digits?)", descKey: "formulaHelp.functions.round" },
  { sig: "abs(x)", descKey: "formulaHelp.functions.abs" },
  { sig: "если(cond, a, b)", descKey: "formulaHelp.functions.if" },
  { sig: "и(a, b, …)", descKey: "formulaHelp.functions.and" },
  { sig: "или(a, b, …)", descKey: "formulaHelp.functions.or" },
  { sig: "не(x)", descKey: "formulaHelp.functions.not" },
];

const EXAMPLES = [
  "{{ С1Р1 + С1Р2 * 2 }}",
  "{{ сумма(С1Р1:С1Р10) }}",
  "{{ среднее(С2Р1:С2Р5) }}",
  "{{ [Цена] * [Количество] }}",
  "{{ если([Оплачено], 0, 1) }}",
  "Итого: {{ сумма(С1Р1:С1Р10) }} руб.",
  "{{ С-1Р1 }} — последний столбец",
  "{{ С-2Р-2:С-1Р-1 }} — правый нижний угол",
];

const ERROR_ROWS: { code: string; key: TranslationInput }[] = [
  { code: "#ЦИКЛ!", key: "formulaHelp.errors.cycle" },
  { code: "#ДЕЛ/0!", key: "formulaHelp.errors.div" },
  { code: "#ИМЯ?", key: "formulaHelp.errors.name" },
  { code: "#ЗНАЧ!", key: "formulaHelp.errors.value" },
  { code: "#ССЫЛКА!", key: "formulaHelp.errors.ref" },
  { code: "#ОШИБКА!", key: "formulaHelp.errors.error" },
];

export const FormulaHelpScreen = () => {
  const { colors } = useTheme();
  const { t } = useTranslate();
  const styles = getStyles(colors);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.intro}>{t("formulaHelp.intro")}</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t("formulaHelp.syntaxTitle")}</Text>
        <Text style={styles.body}>{t("formulaHelp.syntaxBody")}</Text>
        <View style={styles.codeBlock}>
          <Text style={styles.code}>
            {"Итого: {{ сумма(С1Р1:С1Р10) }} руб."}
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t("formulaHelp.referencesTitle")}</Text>
        <Text style={styles.funcDesc}>{t("formulaHelp.references.cells")}</Text>
        <Text style={styles.funcDesc}>{t("formulaHelp.references.range")}</Text>
        <Text style={styles.funcDesc}>
          {t("formulaHelp.references.negative")}
        </Text>
        <Text style={styles.funcDesc}>{t("formulaHelp.references.field")}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t("formulaHelp.functionsTitle")}</Text>
        {FUNCTIONS.map((fn) => (
          <View key={fn.sig} style={styles.funcRow}>
            <Text style={styles.code}>{fn.sig}</Text>
            <Text style={styles.funcDesc}>{t(fn.descKey)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t("formulaHelp.examplesTitle")}</Text>
        {EXAMPLES.map((ex) => (
          <View key={ex} style={styles.exampleRow}>
            <Text style={styles.code}>{ex}</Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t("formulaHelp.errorsTitle")}</Text>
        {ERROR_ROWS.map((row) => (
          <View key={row.code} style={styles.funcRow}>
            <Text style={styles.code}>{row.code}</Text>
            <Text style={styles.funcDesc}>{t(row.key)}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const getStyles = createStyles((colors) => ({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 32 },
  intro: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 16,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textMuted,
    textTransform: "uppercase",
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  body: { fontSize: 14, color: colors.text, lineHeight: 20 },
  codeBlock: {
    marginTop: 10,
    backgroundColor: colors.inputBackground,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  code: {
    fontFamily: "monospace",
    fontSize: 13,
    color: colors.primary,
  },
  funcRow: { marginBottom: 12 },
  funcDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginTop: 4,
  },
  exampleRow: { marginBottom: 8 },
}));
