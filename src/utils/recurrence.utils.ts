import type {
  RecurrenceFreq,
  RecurrenceRule,
  Weekday,
} from "../types/recurrence.types";

const WEEKDAY_INDEX: Record<Weekday, number> = {
  MO: 0,
  TU: 1,
  WE: 2,
  TH: 3,
  FR: 4,
  SA: 5,
  SU: 6,
};

/** Разворачивает "неделю месяца" в диапазон дней: [8, 9, ..., 14] */
function weekOfMonthToDays(week: number): number[] {
  if (week < 1 || week > 5) return [];
  const start = (week - 1) * 7 + 1;
  const end = Math.min(week * 7, 31);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export function ruleToRRule(rule: RecurrenceRule): string {
  if (rule.kind === "simple") return rule.interval;

  const parts: string[] = [`FREQ=${rule.freq}`];
  if (rule.intervalN && rule.intervalN > 1) {
    parts.push(`INTERVAL=${rule.intervalN}`);
  }

  const monthDays = new Set<number>(rule.byMonthDay ?? []);
  for (const week of rule.byWeekOfMonth ?? []) {
    for (const d of weekOfMonthToDays(week)) monthDays.add(d);
  }
  if (monthDays.size > 0) {
    parts.push(
      `BYMONTHDAY=${Array.from(monthDays)
        .sort((a, b) => a - b)
        .join(",")}`,
    );
  }

  if (rule.byDayOrdinal && rule.byDayOrdinal.length > 0) {
    const byday = rule.byDayOrdinal
      .map(({ weekday, ordinal }) => `${ordinal}${weekday}`)
      .join(",");
    parts.push(`BYDAY=${byday}`);
  }

  if (rule.byMonth && rule.byMonth.length > 0) {
    parts.push(`BYMONTH=${rule.byMonth.join(",")}`);
  }

  if (rule.until) {
    const d = new Date(rule.until);
    const iso = d
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");
    parts.push(`UNTIL=${iso}`);
  } else if (rule.count) {
    parts.push(`COUNT=${rule.count}`);
  }

  return `RRULE:${parts.join(";")}`;
}

export function rruleToRule(input: string): RecurrenceRule {
  if (!input.startsWith("RRULE:")) {
    return { kind: "simple", interval: input };
  }

  const [freqPart, ...rest] = input.slice("RRULE:".length).split(";");
  const params: Record<string, string> = {};
  for (const part of rest) {
    const [k, v] = part.split("=");
    if (k && v !== undefined) params[k] = v;
  }
  params[freqPart.split("=")[0]] = freqPart.split("=")[1];

  const rule: RecurrenceRule = {
    kind: "advanced",
    freq: params.FREQ as RecurrenceFreq,
  };

  if (params.INTERVAL) rule.intervalN = parseInt(params.INTERVAL, 10);

  if (params.BYMONTHDAY) {
    rule.byMonthDay = params.BYMONTHDAY.split(",").map((n) => parseInt(n, 10));
  }

  if (params.BYDAY) {
    rule.byDayOrdinal = params.BYDAY.split(",").map((token) => {
      const match = token.match(/^(-?\d+)?([A-Z]{2})$/);
      if (!match) throw new Error("Invalid BYDAY token");
      return {
        ordinal: (match[1] ? parseInt(match[1], 10) : 1) as 1 | 2 | 3 | 4 | -1,
        weekday: match[2] as Weekday,
      };
    });
  }

  if (params.BYMONTH) {
    rule.byMonth = params.BYMONTH.split(",").map((n) => parseInt(n, 10));
  }

  if (params.UNTIL) {
    const s = params.UNTIL;
    rule.until = `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}T${s.slice(9, 11)}:${s.slice(11, 13)}:${s.slice(13, 15)}Z`;
  }

  if (params.COUNT) rule.count = parseInt(params.COUNT, 10);

  return rule;
}

/** Проверка, что правило не пустое и не сломает бэкенд */
export function isRuleValid(rule: RecurrenceRule): boolean {
  if (rule.kind === "simple") return rule.interval.length > 0;

  if (rule.freq === "MONTHLY") {
    const hasAny =
      (rule.byMonthDay && rule.byMonthDay.length > 0) ||
      (rule.byWeekOfMonth && rule.byWeekOfMonth.length > 0) ||
      (rule.byDayOrdinal && rule.byDayOrdinal.length > 0);
    if (!hasAny) return false;
  }
  return true;
}
