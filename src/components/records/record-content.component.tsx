import Markdown from "react-native-markdown-renderer";
import { TouchableOpacity, View } from "react-native";

import { createStyles, getMarkdownStyles } from "../../utils";
import { useTheme } from "../../contexts";
import { renderTemplate } from "../../template";

import { RecordHeader } from "./record-header.component";
import { RecordTags } from "./record-tags.component";
import { RecordMeta } from "./record-meta.component";
import { MyRecord } from "../../types";
import { useRefresh, useToggleStar } from "../../hooks";
import { useState } from "react";
import MaterialIcons from "@react-native-vector-icons/material-icons";

export type RecordContentProperties = {
  record: MyRecord;
  dateLabel: string | null;
  timeLabel: string | null;
};

export const RecordContent = ({
  record,
  dateLabel,
  timeLabel,
}: RecordContentProperties) => {
  const {
    title,
    content,
    tags,
    isCompleted,
    isPinned,
    createdAt,
    updatedAt,
    ...initialRecord
  } = record;
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const markdownStyles = getMarkdownStyles(colors);
  const { toggleStar, isPending } = useToggleStar();
  const [localRecord, setLocalRecord] = useState(initialRecord);

  const { RefreshableScrollView } = useRefresh({
    queryKeys: [["record", initialRecord.id]],
  });

  const handleStarPress = () => {
    if (!isPending) {
      toggleStar(localRecord.id, !!localRecord.isStarred).then(() => {
        setLocalRecord((prev) => ({ ...prev, isStarred: !prev.isStarred }));
      });
    }
  };

  return (
    <RefreshableScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <View style={styles.card}>
        <View style={styles.card_header}>
          <RecordHeader
            // Мержим свежий `localRecord` (там актуальный `isStarred` и
            // прочие локальные тогглы) поверх исходного `record`, чтобы
            // шаблон в шапке реагировал на локальные изменения.
            title={renderTemplate(title, { ...record, ...localRecord })}
            date={dateLabel || undefined}
            time={timeLabel || undefined}
          />

          <TouchableOpacity onPress={handleStarPress} disabled={isPending}>
            <MaterialIcons
              name={localRecord.isStarred ? "star" : "star-border"}
              size={32}
              color={localRecord.isStarred ? colors.primary : colors.textMuted}
            />
          </TouchableOpacity>
        </View>

        <Markdown style={markdownStyles}>{content || ""}</Markdown>

        <RecordTags tags={tags} />

        <RecordMeta
          isCompleted={isCompleted}
          isPinned={isPinned}
          createdAt={createdAt}
          updatedAt={updatedAt}
        />
      </View>
    </RefreshableScrollView>
  );
};

const getStyles = createStyles((colors) => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  card_header: {
    display: "flex",
    flexDirection: "row",
    gap: 8,
    justifyContent: "space-between",
  },
}));
