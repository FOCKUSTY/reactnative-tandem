import { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { MaterialIcons } from "@react-native-vector-icons/material-icons";
import DateTimePicker from "@react-native-community/datetimepicker";

import { useTheme } from "../../contexts";
import { createStyles } from "../../utils";
import { useTranslate } from "../../hooks";
import type {
  RecurrenceFreq,
  RecurrenceRule,
  Weekday,
} from "../../types/recurrence.types";
import { WEEKDAYS, WEEKDAY_LABEL_KEYS } from "../../types/recurrence.types";
import {
  isRuleValid,
  ruleToRRule,
  rruleToRule,
} from "../../utils/recurrence.utils";

type SimpleRule = Extract<RecurrenceRule, { kind: "simple" }>;
type AdvancedRule = Extract<RecurrenceRule, { kind: "advanced" }>;
type Mode = "simple" | "advanced";

export type RecurringPickerProps = {
  value: string;
  onChange: (interval: string) => void;
};

const SIMPLE_REGEX = /^(\d+(?:\.\d+)?)([hdmy])$/;

const PRESET_SIMPLE = [
  { key: "recurring.everyHour", value: "1h" },
  { key: "recurring.everyDay", value: "1d" },
  { key: "recurring.everyWeek", value: "7d" },
  { key: "recurring.everyMonth", value: "1m" },
  { key: "recurring.everyYear", value: "1y" },
] as const;

const FREQS: { value: RecurrenceFreq; labelKey: string }[] = [
  { value: "DAILY", labelKey: "recurring.freq.daily" },
  { value: "WEEKLY", labelKey: "recurring.freq.weekly" },
  { value: "MONTHLY", labelKey: "recurring.freq.monthly" },
  { value: "YEARLY", labelKey: "recurring.freq.yearly" },
];

const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const MONTH_DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const WEEKS_OF_MONTH: Array<1 | 2 | 3 | 4 | 5> = [1, 2, 3, 4, 5];

export const RecurringPicker = ({ value, onChange }: RecurringPickerProps) => {
  const { colors } = useTheme();
  const { t } = useTranslate();
  const styles = getStyles(colors);

  const initial = rruleToRule(value);
  const isAdvancedInitially = initial.kind === "advanced";

  const [mode, setMode] = useState<Mode>(
    isAdvancedInitially ? "advanced" : "simple",
  );
  const [simpleValue, setSimpleValue] = useState<string>(
    !isAdvancedInitially ? (initial as SimpleRule).interval : "1d",
  );
  const [advancedRule, setAdvancedRule] = useState<AdvancedRule>(
    isAdvancedInitially
      ? (initial as AdvancedRule)
      : { kind: "advanced", freq: "MONTHLY", byMonthDay: [1] },
  );

  const lastEmittedRef = useRef<string>(value);

  const emit = useCallback(
    (next: string) => {
      lastEmittedRef.current = next;
      onChange(next);
    },
    [onChange],
  );

  useEffect(() => {
    if (value === lastEmittedRef.current) return;
    lastEmittedRef.current = value;
    const parsed = rruleToRule(value);
    if (parsed.kind === "simple") {
      setMode("simple");
      setSimpleValue(parsed.interval);
    } else {
      setMode("advanced");
      setAdvancedRule(parsed);
    }
  }, [value]);

  const switchMode = (next: Mode) => {
    if (next === mode) return;
    setMode(next);
    if (next === "simple") {
      emit(simpleValue);
    } else {
      emit(ruleToRRule(advancedRule));
    }
  };

  const updateSimple = (next: string) => {
    setSimpleValue(next);
    emit(next);
  };

  const updateAdvanced = (patch: Partial<AdvancedRule>) => {
    const merged: AdvancedRule = { ...advancedRule, ...patch };
    setAdvancedRule(merged);
    if (isRuleValid(merged)) {
      emit(ruleToRRule(merged));
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, mode === "simple" && styles.tabActive]}
          onPress={() => switchMode("simple")}
          activeOpacity={0.7}
        >
          <Text
            style={[styles.tabText, mode === "simple" && styles.tabTextActive]}
          >
            {t("recurring.mode.simple")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, mode === "advanced" && styles.tabActive]}
          onPress={() => switchMode("advanced")}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.tabText,
              mode === "advanced" && styles.tabTextActive,
            ]}
          >
            {t("recurring.mode.advanced")}
          </Text>
        </TouchableOpacity>
      </View>

      {mode === "simple" ? (
        <SimpleMode value={simpleValue} onChange={updateSimple} />
      ) : (
        <AdvancedMode rule={advancedRule} update={updateAdvanced} />
      )}
    </View>
  );
};

type ChipProps = {
  label: string;
  active: boolean;
  onPress: () => void;
  small?: boolean;
  flex?: boolean;
};

const Chip = ({ label, active, onPress, small, flex }: ChipProps) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  return (
    <TouchableOpacity
      style={[
        styles.chip,
        small && styles.chipSmall,
        flex && styles.chipFlex,
        active && styles.chipActive,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.chipText,
          small && styles.chipTextSmall,
          active && styles.chipTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

type SimpleModeProps = {
  value: string;
  onChange: (next: string) => void;
};

const SimpleMode = ({ value, onChange }: SimpleModeProps) => {
  const { colors } = useTheme();
  const { t } = useTranslate();
  const styles = getStyles(colors);

  const isPreset = PRESET_SIMPLE.some((p) => p.value === value);
  const [customText, setCustomText] = useState(isPreset ? "" : value);

  const handleCustomChange = (text: string) => {
    setCustomText(text);
    const trimmed = text.trim();
    if (SIMPLE_REGEX.test(trimmed)) {
      onChange(trimmed);
    }
  };

  return (
    <View>
      <View style={styles.presets}>
        {PRESET_SIMPLE.map((preset) => (
          <Chip
            key={preset.value}
            active={value === preset.value}
            label={t(preset.key as any)}
            onPress={() => {
              setCustomText("");
              onChange(preset.value);
            }}
          />
        ))}
      </View>

      <View style={styles.customRow}>
        <Text style={styles.customLabel}>{t("recurring.ourInterval")}</Text>
        <TextInput
          style={styles.customInput}
          placeholder={`${t("recurring.example")} 3h, 2d, 2m`}
          placeholderTextColor={colors.textMuted}
          value={customText}
          onChangeText={handleCustomChange}
          autoCapitalize="none"
        />
      </View>
    </View>
  );
};

type AdvancedModeProps = {
  rule: AdvancedRule;
  update: (patch: Partial<AdvancedRule>) => void;
};

const AdvancedMode = ({ rule, update }: AdvancedModeProps) => {
  const { colors } = useTheme();
  const { t } = useTranslate();
  const styles = getStyles(colors);
  const [showUntilPicker, setShowUntilPicker] = useState(false);

  const toggleInArray = <T extends number>(
    field: "byMonthDay" | "byMonth",
    n: T,
  ) => {
    const current: number[] = (rule[field] as number[] | undefined) ?? [];
    const next = current.includes(n)
      ? current.filter((x) => x !== n)
      : [...current, n].sort((a, b) => a - b);
    update({ [field]: next } as Partial<AdvancedRule>);
  };

  const toggleWeekOfMonth = (week: 1 | 2 | 3 | 4 | 5) => {
    const current = rule.byWeekOfMonth ?? [];
    const next = current.includes(week)
      ? current.filter((w) => w !== week)
      : ([...current, week].sort((a, b) => a - b) as Array<1 | 2 | 3 | 4 | 5>);
    update({ byWeekOfMonth: next });
  };

  const toggleOrdinalWeekday = (weekday: Weekday) => {
    const current = rule.byDayOrdinal ?? [];
    const existing = current.find((d) => d.weekday === weekday);
    const next = existing
      ? current.filter((d) => d.weekday !== weekday)
      : [...current, { weekday, ordinal: 1 as const }];
    update({ byDayOrdinal: next });
  };

  const clearUntil = () => update({ until: undefined });

  return (
    <View>
      <Text style={styles.sectionLabel}>{t("recurring.freq.label")}</Text>
      <View style={styles.chipRow}>
        {FREQS.map((f) => (
          <Chip
            key={f.value}
            active={rule.freq === f.value}
            label={t(f.labelKey as any)}
            onPress={() => update({ freq: f.value })}
          />
        ))}
      </View>

      {rule.freq === "MONTHLY" && (
        <>
          <Text style={styles.sectionLabel}>
            {t("recurring.monthly.byMonthDay")}
          </Text>
          <View style={styles.grid}>
            {MONTH_DAYS.map((n) => (
              <Chip
                key={n}
                small
                active={(rule.byMonthDay ?? []).includes(n)}
                label={String(n)}
                onPress={() => toggleInArray("byMonthDay", n)}
              />
            ))}
          </View>

          <Text style={styles.sectionLabel}>
            {t("recurring.monthly.byWeekOfMonth")}
          </Text>
          <View style={styles.chipRow}>
            {WEEKS_OF_MONTH.map((w) => (
              <Chip
                key={w}
                active={(rule.byWeekOfMonth ?? []).includes(w)}
                label={t(`recurring.week.${w}` as any)}
                onPress={() => toggleWeekOfMonth(w)}
              />
            ))}
          </View>

          <Text style={styles.sectionLabel}>
            {t("recurring.monthly.byWeekdayOfMonth")}
          </Text>
          <View style={styles.chipRow}>
            {WEEKDAYS.map((wd) => (
              <Chip
                key={wd}
                active={(rule.byDayOrdinal ?? []).some((d) => d.weekday === wd)}
                label={t(WEEKDAY_LABEL_KEYS[wd] as any)}
                onPress={() => toggleOrdinalWeekday(wd)}
              />
            ))}
          </View>
        </>
      )}

      <Text style={styles.sectionLabel}>{t("recurring.limitMonths")}</Text>
      <View style={styles.grid}>
        {MONTHS.map((m) => (
          <Chip
            key={m}
            small
            active={(rule.byMonth ?? []).includes(m)}
            label={t(`recurring.monthsShort.${m}` as any)}
            onPress={() => toggleInArray("byMonth", m)}
          />
        ))}
      </View>

      <Text style={styles.sectionLabel}>{t("recurring.until")}</Text>
      <View style={styles.untilRow}>
        <TouchableOpacity
          style={styles.untilButton}
          onPress={() => setShowUntilPicker(true)}
          activeOpacity={0.7}
        >
          <MaterialIcons name="event" size={18} color={colors.primary} />
          <Text style={styles.untilButtonText}>
            {rule.until
              ? new Date(rule.until).toLocaleDateString()
              : t("recurring.untilNever")}
          </Text>
        </TouchableOpacity>

        {rule.until && (
          <TouchableOpacity
            style={styles.untilClear}
            onPress={clearUntil}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MaterialIcons name="close" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {showUntilPicker && (
        <DateTimePicker
          value={rule.until ? new Date(rule.until) : new Date()}
          mode="date"
          display="default"
          onValueChange={(_, date) => {
            setShowUntilPicker(false);
            if (date) {
              const endOfDay = new Date(date);
              endOfDay.setHours(23, 59, 59, 999);
              update({ until: endOfDay.toISOString() });
            }
          }}
          onDismiss={() => setShowUntilPicker(false)}
        />
      )}
    </View>
  );
};

const getStyles = createStyles((colors) => ({
  container: {
    marginVertical: 8,
  },

  tabs: {
    flexDirection: "row",
    backgroundColor: colors.inputBackground,
    borderRadius: 8,
    padding: 4,
    marginBottom: 12,
    gap: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  tabText: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: "500",
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: "600",
  },

  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  chipSmall: {
    paddingHorizontal: 0,
    paddingVertical: 4,
    borderRadius: 6,
    minWidth: 36,
    alignItems: "center",
  },
  chipFlex: {
    flex: 1,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  chipTextSmall: {
    fontSize: 12,
  },
  chipTextActive: {
    color: "#fff",
    fontWeight: "600",
  },

  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textMuted,
    textTransform: "uppercase",
    marginTop: 14,
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },

  presets: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  customRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  customLabel: {
    fontSize: 14,
    color: colors.text,
  },
  customInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.inputBackground,
    color: colors.text,
    padding: 8,
    borderRadius: 8,
    fontSize: 14,
  },

  untilRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  untilButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.inputBackground,
  },
  untilButtonText: {
    fontSize: 14,
    color: colors.text,
  },
  untilClear: {
    padding: 6,
  },
}));
