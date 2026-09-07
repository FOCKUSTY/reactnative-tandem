import Markdown from "react-native-markdown-renderer";
import { TouchableOpacity, View } from "react-native";

import { createStyles, getMarkdownStyles } from "../../utils";
import { useTheme } from "../../contexts";

import { RecordHeader } from "./record-header.component";
import { RecordTags } from "./record-tags.component";
import { RecordMeta } from "./record-meta.component";
import { MyRecord } from "../../types";
import { useRefresh, useToggleStar } from "../../hooks";
import { useState } from "react";
import MaterialIcons from "@react-native-vector-icons/material-icons";

export type RecordContentProperties = {
  record: MyRecord & {
    dateLabel: string | null;
    timeLabel: string | null;
  };
};

export const RecordContent = ({
  record: {
    title,
    dateLabel,
    timeLabel,
    content,
    tags,
    isCompleted,
    isPinned,
    createdAt,
    updatedAt,
    ...initialRecord
  },
}: RecordContentProperties) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const markdownStyles = getMarkdownStyles(colors);
  const { toggleStar, isPending } = useToggleStar();
  const [record, setRecord] = useState(initialRecord);

  const { RefreshableScrollView } = useRefresh({
    queryKeys: [["record", initialRecord.id]],
  });

  const handleStarPress = () => {
    if (!isPending) {
      toggleStar(record.id, !!record.isStarred).then(() => {
        setRecord((prev) => ({ ...prev, isStarred: !prev.isStarred }));
      });
    }
  };

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

        <TouchableOpacity onPress={handleStarPress} disabled={isPending}>
          <MaterialIcons
            name={record.isStarred ? "star" : "star-border"}
            size={32}
            color={record.isStarred ? colors.primary : colors.textMuted}
          />
        </TouchableOpacity>

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
}));
