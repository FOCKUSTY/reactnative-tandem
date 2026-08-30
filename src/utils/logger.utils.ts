import * as FileSystem from "expo-file-system";
import { Platform } from "react-native";
import pako from "pako";

import { NAME, VERSION } from "../constants";
import { timestamp as dateTimestamp, formatIso, timestamp } from "./date.utils";

let loggingEnabled = true;

const name = NAME.toLowerCase();
const fileName = name + ".log";

const LOG_DIR_PATH = FileSystem.Paths.document.uri;
const LOG_FILE_PATH = LOG_DIR_PATH + fileName;
const MAX_LOG_SIZE = 1024 * 1024;
const MAX_LOG_FILES = 5;

export interface LogEntry {
  timestamp: string;
  level: "INFO" | "WARN" | "ERROR" | "DEBUG";
  message: string;
  data?: any;
  appVersion: string;
  platform: string;
  osVersion: string;
}

export const setLoggingEnabled = (enabled: boolean) => {
  loggingEnabled = enabled;
};

async function ensureLogDir() {
  const logDir = new FileSystem.Directory(LOG_DIR_PATH);
  if (!logDir.exists) {
    logDir.create();
  }
}

/**
 * Сжимает файл в .gz и удаляет оригинал
 */
async function compressFile(filePath: string) {
  try {
    const file = new FileSystem.File(filePath);
    if (!file.exists) return;

    const content = await file.text();
    const compressed = pako.gzip(content);
    const gzPath = filePath + ".gz";
    const gzFile = new FileSystem.File(gzPath);
    gzFile.write(compressed);

    file.delete();
  } catch (error) {
    console.error("Compression failed:", error);
  }
}

/**
 * Распаковывает .gz файл и возвращает содержимое как строку
 */
async function decompressFile(gzPath: string): Promise<string> {
  const gzFile = new FileSystem.File(gzPath);
  if (!gzFile.exists) return "";
  const compressed = await gzFile.bytes();
  const decompressed = pako.ungzip(compressed, { toText: true });
  return decompressed;
}

async function rotateLogs() {
  const logFile = new FileSystem.File(LOG_FILE_PATH);
  if (logFile.exists) {
    if (logFile.size > MAX_LOG_SIZE) {
      const timestamp = dateTimestamp().replace(/[:.]/g, "-");
      const archiveName = `${name}-${timestamp}.log`;
      const archivePath = LOG_DIR_PATH + archiveName;

      await logFile.move(new FileSystem.File(archivePath));

      await compressFile(archivePath);

      const logDir = new FileSystem.Directory(LOG_DIR_PATH);
      const files = logDir.list();
      const logFiles = files
        .filter(
          (f) =>
            (f.name.startsWith(`${name}-`) && f.name.endsWith(".log")) ||
            (f.name.startsWith(`${name}-`) && f.name.endsWith(".log.gz")),
        )
        .map((f) => f.name)
        .sort();

      while (logFiles.length > MAX_LOG_FILES - 1) {
        const oldest = logFiles.shift();
        if (oldest) {
          const fileToDelete = new FileSystem.File(LOG_DIR_PATH + oldest);
          fileToDelete.delete();
        }
      }
    }
  }
}

async function writeLog(level: LogEntry["level"], message: string, data?: any) {
  if (!loggingEnabled) return;

  try {
    await ensureLogDir();
    await rotateLogs();

    const entry: LogEntry = {
      timestamp: timestamp(),
      level,
      message,
      data,
      appVersion: VERSION,
      platform: Platform.OS,
      osVersion: Platform.Version as string,
    };

    const jsonLine = JSON.stringify(entry) + "\n";
    const logFile = new FileSystem.File(LOG_FILE_PATH);
    logFile.write(jsonLine, { append: true });
  } catch (error) {
    console.error("Logger failed:", error);
  }
}

export const logger = {
  info: (message: string, data?: any) => writeLog("INFO", message, data),
  warn: (message: string, data?: any) => writeLog("WARN", message, data),
  error: (message: string, data?: any) => writeLog("ERROR", message, data),
  debug: (message: string, data?: any) => {
    if (__DEV__) {
      writeLog("DEBUG", message, data);
    }
  },

  getRawLogs: async (): Promise<string> => {
    const logFile = new FileSystem.File(LOG_FILE_PATH);
    if (!logFile.exists) return "";
    return await logFile.text();
  },

  getAllLogEntries: async (): Promise<LogEntry[]> => {
    const entries: LogEntry[] = [];

    const currentRaw = await logger.getRawLogs();
    if (currentRaw) {
      const currentEntries = currentRaw
        .split("\n")
        .filter((line) => line.trim() !== "")
        .map((line) => {
          try {
            return JSON.parse(line) as LogEntry;
          } catch {
            return null;
          }
        })
        .filter((e): e is LogEntry => e !== null);
      entries.push(...currentEntries);
    }

    const logDir = new FileSystem.Directory(LOG_DIR_PATH);
    const files = logDir.list();
    const archives = files
      .filter(
        (f) => f.name.startsWith(`${name}-`) && f.name.endsWith(".log.gz"),
      )
      .map((f) => f.name)
      .sort();

    for (const archiveName of archives) {
      const archivePath = LOG_DIR_PATH + archiveName;
      try {
        const content = await decompressFile(archivePath);
        const parsed = content
          .split("\n")
          .filter((line) => line.trim() !== "")
          .map((line) => {
            try {
              return JSON.parse(line) as LogEntry;
            } catch {
              return null;
            }
          })
          .filter((e): e is LogEntry => e !== null);
        entries.push(...parsed);
      } catch (error) {
        console.error("Failed to decompress archive:", archiveName, error);
      }
    }

    entries.sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );
    return entries;
  },

  getFormattedLogs: async (): Promise<string> => {
    const entries = await logger.getAllLogEntries();
    if (entries.length === 0) return "Логов пока нет.";

    return entries
      .map((e) => {
        const date = new Date(e.timestamp);
        const timeStr = date.toLocaleString();
        let line = `[${timeStr}] [${e.level}] ${e.message}`;
        if (e.data) {
          line += `\n  └─ ${JSON.stringify(e.data, null, 2)}`;
        }
        return line;
      })
      .join("\n");
  },

  clearLogs: async () => {
    const logFile = new FileSystem.File(LOG_FILE_PATH);
    if (logFile.exists) {
      logFile.delete();
    }
    const logDir = new FileSystem.Directory(LOG_DIR_PATH);
    const files = logDir.list();
    for (const file of files) {
      if (
        (file.name.startsWith(`${name}-`) && file.name.endsWith(".log")) ||
        (file.name.startsWith(`${name}-`) && file.name.endsWith(".log.gz"))
      ) {
        const fileToDelete = new FileSystem.File(LOG_DIR_PATH + file.name);
        fileToDelete.delete();
      }
    }
  },

  /**
   * Экспортирует все логи в один файл и возвращает его URI.
   * Файл сохраняется во временную директорию и доступен для шаринга.
   */
  exportLogs: async (format: "text" | "json" = "text"): Promise<string> => {
    const entries = await logger.getAllLogEntries();
    if (entries.length === 0) {
      throw new Error("Нет логов для экспорта");
    }

    let content: string;
    let fileName: string;

    if (format === "json") {
      content = JSON.stringify(entries, null, 2);
      fileName = `tandem-logs-${timestamp().replace(/[:.]/g, "-")}.json`;
    } else {
      content = entries
        .map((entry) => {
          const timeString = formatIso(entry.timestamp);
          let line = `[${timeString}] [${entry.level}] ${entry.message}`;
          if (entry.data) {
            line += `\n  └─ ${JSON.stringify(entry.data, null, 2)}`;
          }
          return line;
        })
        .join("\n");
      fileName = `${name}-logs-${timestamp().replace(/[:.]/g, "-")}.txt`;
    }

    const tempDir = FileSystem.Paths.cache.uri;
    const tempFile = tempDir + fileName;
    const file = new FileSystem.File(tempFile);
    file.write(content);

    return tempFile;
  },
};
