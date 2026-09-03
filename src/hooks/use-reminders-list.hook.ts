import { useMemo } from "react";
import { useRecords } from "./records";
import { useReminder } from "./use-reminder.hook";
import { MyRecord } from "../types";

export const useRemindersList = () => {
  const { data: records = [] } = useRecords();
  const { offsets } = useReminder();

  const futureRecords = useMemo(() => {
    const now = new Date();
    return records
      .filter((r) => r.dateEvent && new Date(r.dateEvent) > now)
      .sort(
        (a, b) =>
          new Date(a.dateEvent!).getTime() - new Date(b.dateEvent!).getTime(),
      );
  }, [records]);

  return {
    records: futureRecords as (MyRecord & { dateEvent: string })[],
    offsets,
  };
};
