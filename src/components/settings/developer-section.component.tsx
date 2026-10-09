import { LoggingSection } from "./logging-section.component";
import { CacheSection } from "./cache-section.component";
import { ApiUrlSection } from "./api-url-section.component";

/**
 * Скрытые разделы настроек, доступные только в режиме разработчика.
 *
 * Сюда добавляй новые отладочные секции — они автоматически появятся
 * при включённом режиме разработчика и не будут мешать обычным
 * пользователям.
 */
export const DeveloperSection = () => {
  return (
    <>
      <LoggingSection />
      <CacheSection />
      <ApiUrlSection />
    </>
  );
};
