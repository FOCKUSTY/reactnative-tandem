import type { MyRecord } from "../types";
import { hasTemplate, renderTemplate } from "./render";

/**
 * Прогоняет title и content записи через шаблонизатор.
 *
 * Стратегия: шаблоны применяются один раз — в момент получения записи с
 * бэкенда, а не при каждом рендере. Так UI не пересчитывает `{{ days([date]) }}`
 * многократно на одну и ту же запись, и все списки (карточки, превью, шапка
 * записи) автоматически получают уже готовый текст.
 *
 * Исходные (сырые) значения сохраняем в `templateSource`, чтобы форма
 * редактирования показывала пользователю сам шаблон, а не его результат.
 * Если шаблонов нет — возвращаем тот же объект: react-query не плодит новые
 * ссылки и не вызывает лишних ререндеров.
 */
export const applyTemplatesToRecord = (record: MyRecord): MyRecord => {
  const source = {
    title: record.templateSource?.title ?? record.title,
    content: record.templateSource?.content ?? record.content,
  };

  const titleHasTemplate = hasTemplate(source.title);
  const contentHasTemplate = hasTemplate(source.content);
  if (!titleHasTemplate && !contentHasTemplate) return record;

  return {
    ...record,
    title: titleHasTemplate
      ? renderTemplate(source.title, record)
      : source.title,
    content: contentHasTemplate
      ? renderTemplate(source.content, record)
      : source.content,
    templateSource: source,
  };
};

export const applyTemplatesToRecords = (records: MyRecord[]): MyRecord[] =>
  records.map(applyTemplatesToRecord);
