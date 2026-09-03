import { useEffect, useState } from "react";
import { notificationService } from "../services/notification.service";
import { useRecords } from "./records";
import { useAuth } from "./auth";

export const useReminder = () => {
  const { user } = useAuth();
  const [offsets, setOffsets] = useState<number[]>([]);
  const { data: records = [] } = useRecords();

  useEffect(() => {
    notificationService.getReminderOffsets().then(setOffsets);
  }, []);

  useEffect(() => {
    if (user) {
      const recordsWithDate = records.filter((r) => r.dateEvent);
      notificationService.rescheduleAllForRecords(recordsWithDate);
    }
  }, [user, records, offsets]);

  const updateOffsets = async (newOffsets: number[]) => {
    await notificationService.setReminderOffsets(newOffsets);
    setOffsets(newOffsets);
    const recordsWithDate = records.filter((r) => r.dateEvent);
    await notificationService.rescheduleAllForRecords(
      recordsWithDate,
      newOffsets,
    );
  };

  return { offsets, updateOffsets };
};
