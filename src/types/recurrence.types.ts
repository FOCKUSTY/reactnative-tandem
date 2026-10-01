export type RecurrenceFreq = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";

export type Weekday = "MO" | "TU" | "WE" | "TH" | "FR" | "SA" | "SU";

/** Правило: либо "простое" (1h, 1d, ...), либо составное (RRULE) */
export type RecurrenceRule =
  | { kind: "simple"; interval: string }
  | {
      kind: "advanced";
      freq: RecurrenceFreq;
      intervalN?: number; // каждые N единиц, по умолчанию 1

      /** "По числам месяца": [1, 15, 30] */
      byMonthDay?: number[];

      /** "По неделям месяца": первый вторник, последняя пятница и т.д. */
      byDayOrdinal?: Array<{ weekday: Weekday; ordinal: 1 | 2 | 3 | 4 | -1 }>;

      /** "Целые недели месяца": 1-я неделя = 1-7, 2-я = 8-14, ... */
      byWeekOfMonth?: Array<1 | 2 | 3 | 4 | 5>;

      /** Ограничить месяцами: [9, 10, 11] */
      byMonth?: number[];

      /** Окончание */
      until?: string; // ISO date
      count?: number;
    };

export const WEEKDAYS: Weekday[] = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];

export const WEEKDAY_LABEL_KEYS: Record<Weekday, string> = {
  MO: "recurring.weekdays.mo",
  TU: "recurring.weekdays.tu",
  WE: "recurring.weekdays.we",
  TH: "recurring.weekdays.th",
  FR: "recurring.weekdays.fr",
  SA: "recurring.weekdays.sa",
  SU: "recurring.weekdays.su",
};
