import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
  FC,
} from "react";

import { notificationService } from "../services/notification.service";
import { useRecords } from "../hooks/records/use-records.hook";
import { useAuth } from "./auth.context";
import { logger } from "../utils";

type ReminderContextType = {
  offsets: number[];
  updateOffsets: (next: number[]) => Promise<void>;
};

const ReminderContext = createContext<ReminderContextType | undefined>(
  undefined,
);

export const ReminderProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { data: records = [] } = useRecords();
  const [offsets, setOffsets] = useState<number[]>([]);

  const queueRef = useRef<Promise<void>>(Promise.resolve());
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    notificationService.getReminderOffsets().then(setOffsets);
  }, []);

  const scheduleReschedule = useCallback(
    (recordsSnapshot: typeof records, offsetsSnapshot?: number[]) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        const recordsWithDate = recordsSnapshot.filter((r) => r.dateEvent);
        queueRef.current = queueRef.current
          .then(() =>
            notificationService.rescheduleAllForRecords(
              recordsWithDate,
              offsetsSnapshot,
            ),
          )
          .catch((e) => {
            void logger.warn("Reschedule failed", {
              error: e instanceof Error ? e.message : String(e),
            });
          });
      }, 500);
    },
    [],
  );

  useEffect(() => {
    if (!user) return;
    scheduleReschedule(records);
  }, [user, records, scheduleReschedule]);

  const updateOffsets = useCallback(
    async (next: number[]) => {
      await notificationService.setReminderOffsets(next);
      setOffsets(next);
      scheduleReschedule(records, next);
    },
    [records, scheduleReschedule],
  );

  return (
    <ReminderContext.Provider value={{ offsets, updateOffsets }}>
      {children}
    </ReminderContext.Provider>
  );
};

export const useReminder = () => {
  const context = useContext(ReminderContext);
  if (!context)
    throw new Error("useReminder must be used within ReminderProvider");
  return context;
};
