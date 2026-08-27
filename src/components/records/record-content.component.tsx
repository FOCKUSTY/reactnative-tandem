import Markdown from "react-native-markdown-renderer";
import { View, ScrollView } from "react-native";

import { createStyles, getMarkdownStyles } from "../../utils";
import { useTheme } from "../../contexts";

import { RecordHeader } from "./record-header.component";
import { RecordTags } from "./record-tags.component";
import { RecordMeta } from "./record-meta.component";

export type RecordContentProperties = {
  title?: string;
  dateLabel: string | null;
  timeLabel: string | null;
  content?: string;
  tags: string[];
  isCompleted: boolean;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
};

export const RecordContent = ({
  title,
  dateLabel,
  timeLabel,
  content,
  tags,
  isCompleted,
  isPinned,
  createdAt,
  updatedAt,
}: RecordContentProperties) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const markdownStyles = getMarkdownStyles(colors);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <RecordHeader
          title={title}
          date={dateLabel || undefined}
          time={timeLabel || undefined}
        />

        <Markdown style={markdownStyles}>{content || ""}</Markdown>

        <RecordTags tags={tags} />

        <RecordMeta
          isCompleted={isCompleted}
          isPinned={isPinned}
          createdAt={createdAt}
          updatedAt={updatedAt}
        />
      </View>
    </ScrollView>
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
