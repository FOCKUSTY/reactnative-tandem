import { ScrollView, Text, View } from "react-native";

import type { TranslationInput } from "../i18n";
import { createStyles } from "../utils";
import { useTheme } from "../contexts";
import { useTranslate } from "../hooks";

const VARIABLES = [
  "[date]",
  "[createdAt]",
  "[updatedAt]",
  "[title]",
  "[content]",
  "[tags]",
  "[section]",
  "[sectionSlug]",
  "[isCompleted]",
  "[isPinned]",
  "[now]",
  "[today]",
  "[author.name]",
  "[author.username]",
  "[partner.name]",
  "[partner.username]",
];

const FUNCTIONS: { sig: string; descKey: TranslationInput }[] = [
  { sig: "years(a, b?)", descKey: "templateHelp.functions.years" },
  { sig: "months(a, b?)", descKey: "templateHelp.functions.months" },
  { sig: "weeks(a, b?)", descKey: "templateHelp.functions.weeks" },
  { sig: "days(a, b?)", descKey: "templateHelp.functions.days" },
  { sig: "hours(a, b?)", descKey: "templateHelp.functions.hours" },
  { sig: "age(date, at?)", descKey: "templateHelp.functions.age" },
  {
    sig: "formatDate(date, pattern?)",
    descKey: "templateHelp.functions.formatDate",
  },
  {
    sig: "plural(n, one, few, many)",
    descKey: "templateHelp.functions.plural",
  },
  { sig: "join(arr, sep?)", descKey: "templateHelp.functions.join" },
  { sig: "count(arr)", descKey: "templateHelp.functions.count" },
  { sig: "capitalize(s)", descKey: "templateHelp.functions.capitalize" },
];

const EXAMPLES = [
  "{{ years([date]) }}-летие свадьбы",
  "{{ days([date]) }} дней вместе",
  '{{ plural(years([date]), "год", "года", "лет") }}',
  '{{ formatDate([date], "EEEE, d MMMM") }}',
  '{{ years([date]) >= 5 ? "юбилей!" : "ещё рано" }}',
  "С днём рождения, {{ [partner.name] }}!",
  'Теги: {{ join([tags], " · ") }}',
  "{{ capitalize([section]) }}: {{ [title] }}",
];

export const TemplateHelpScreen = () => {
  const { colors } = useTheme();
  const { t } = useTranslate();
  const styles = getStyles(colors);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.intro}>{t("templateHelp.intro")}</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t("templateHelp.syntaxTitle")}</Text>
        <Text style={styles.body}>{t("templateHelp.syntaxBody")}</Text>
        <View style={styles.codeBlock}>
          <Text style={styles.code}>{`{{ years([date]) }}`}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t("templateHelp.variablesTitle")}</Text>
        <View style={styles.chips}>
          {VARIABLES.map((v) => (
            <View key={v} style={styles.chip}>
              <Text style={styles.chipText}>{v}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t("templateHelp.functionsTitle")}</Text>
        {FUNCTIONS.map((fn) => (
          <View key={fn.sig} style={styles.funcRow}>
            <Text style={styles.code}>{fn.sig}</Text>
            <Text style={styles.funcDesc}>{t(fn.descKey)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t("templateHelp.examplesTitle")}</Text>
        {EXAMPLES.map((ex) => (
          <View key={ex} style={styles.exampleRow}>
            <Text style={styles.code}>{ex}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const getStyles = createStyles((colors) => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
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
  body: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
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
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    backgroundColor: colors.inputBackground,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  chipText: {
    fontFamily: "monospace",
    fontSize: 12,
    color: colors.text,
  },
  funcRow: {
    marginBottom: 12,
  },
  funcDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginTop: 4,
  },
  exampleRow: {
    marginBottom: 8,
  },
}));

export default TemplateHelpScreen;
