import Markdown from "react-native-markdown-renderer";
import { View } from "react-native";

import { createStyles, getMarkdownStyles } from "../../utils";
import { useTheme } from "../../contexts";

import { RecordHeader } from "./record-header.component";
import { RecordTags } from "./record-tags.component";
import { RecordMeta } from "./record-meta.component";
import { MyRecord } from "../../types";
import { useRefresh } from "../../hooks";

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
  const { title, content, tags, isCompleted, isPinned, createdAt, updatedAt } =
    record;
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const markdownStyles = getMarkdownStyles(colors);

  const cellMarkdownStyles = {
    ...markdownStyles,
    root: { ...markdownStyles.root, flex: 0 as const },
  };

  const { RefreshableScrollView } = useRefresh({
    queryKeys: [["record", record.id]],
  });

  return (
    <RefreshableScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <View style={styles.card}>
        <RecordHeader
          title={title}
          date={dateLabel || undefined}
          time={timeLabel || undefined}
        />

        <Markdown style={cellMarkdownStyles}>{content || ""}</Markdown>

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
}));
