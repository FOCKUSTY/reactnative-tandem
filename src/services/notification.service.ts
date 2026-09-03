import * as Notifications from "expo-notifications";
import { storage } from "../utils/storage.utils";

const REMINDER_OFFSETS_KEY = ".reminder_offsets";
const DEFAULT_OFFSETS = [1440];

export const notificationService = {
  requestPermissions: async (): Promise<boolean> => {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      console.warn("Notification permissions not granted");
      return false;
    }
    return true;
  },

  getReminderOffsets: async (): Promise<number[]> => {
    const stored = await storage.getItem(REMINDER_OFFSETS_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (
          Array.isArray(parsed) &&
          parsed.every((v) => typeof v === "number" && v >= 0)
        ) {
          return parsed;
        }
      } catch {}
    }
    return DEFAULT_OFFSETS;
  },

  setReminderOffsets: async (offsets: number[]) => {
    await storage.setItem(REMINDER_OFFSETS_KEY, JSON.stringify(offsets));
  },

  scheduleForRecord: async (
    recordId: string,
    title: string,
    dateEvent: string,
    offsets?: number[],
  ): Promise<string[]> => {
    const hasPermission = await notificationService.requestPermissions();
    if (!hasPermission) return [];

    const eventDate = new Date(dateEvent);
    const now = new Date();
    if (eventDate <= now) return [];

    const offsetsToUse =
      offsets ?? (await notificationService.getReminderOffsets());
    const scheduledIds: string[] = [];

    for (const offsetMinutes of offsetsToUse) {
      const triggerDate = new Date(
        eventDate.getTime() - offsetMinutes * 60 * 1000,
      );
      if (triggerDate <= now) continue;

      const notificationId = `record_${recordId}_offset_${offsetMinutes}`;
      await Notifications.scheduleNotificationAsync({
        identifier: notificationId,
        content: {
          title: "Напоминание",
          body: `📅 ${title || "Запись"}`,
          data: { recordId },
          sound: true,
        },
        trigger: {
          type: "date",
          date: triggerDate,
        } as Notifications.DateTriggerInput,
      });
      scheduledIds.push(notificationId);
    }

    return scheduledIds;
  },

  cancelScheduled: async (notificationId: string) => {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  },

  cancelAll: async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
  },

  rescheduleAllForRecords: async (
    records: Array<{ id: string; title?: string; dateEvent?: string | null }>,
    offsets?: number[],
  ) => {
    await Notifications.cancelAllScheduledNotificationsAsync();
    const offsetsToUse =
      offsets ?? (await notificationService.getReminderOffsets());
    for (const record of records) {
      if (record.dateEvent) {
        await notificationService.scheduleForRecord(
          record.id,
          record.title || "Без названия",
          record.dateEvent,
          offsetsToUse,
        );
      }
    }
  },
};
