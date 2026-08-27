import { ThemeColors } from "./colors";

export const getMarkdownStyles = (colors: ThemeColors) => ({
  root: {
    flex: 1,
  },

  text: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 24,
  },

  body: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 24,
  },

  paragraph: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 24,
    marginVertical: 4,
  },

  heading1: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "700",
    marginVertical: 8,
  },
  heading2: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "700",
    marginVertical: 6,
  },
  heading3: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "600",
    marginVertical: 4,
  },
  heading4: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "600",
    marginVertical: 4,
  },
  heading5: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
    marginVertical: 4,
  },
  heading6: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
    marginVertical: 4,
  },

  strong: {
    fontWeight: "700",
    color: colors.text,
  },
  em: {
    fontStyle: "italic",
    color: colors.text,
  },
  strikethrough: {
    textDecorationLine: "line-through",
    color: colors.text,
  },

  blockquote: {
    backgroundColor: colors.inputBackground,
    borderLeftColor: colors.primary,
    borderLeftWidth: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginVertical: 8,
    borderRadius: 4,
  },
  blockquoteText: {
    color: colors.textSecondary,
    fontSize: 16,
    lineHeight: 22,
  },

  listItem: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 24,
    marginVertical: 2,
  },
  listItemBullet: {
    color: colors.text,
    fontSize: 16,
    marginRight: 8,
  },
  listItemNumber: {
    color: colors.text,
    fontSize: 16,
    marginRight: 8,
  },

  link: {
    color: colors.primary,
    textDecorationLine: "underline",
  },

  code: {
    fontFamily: "monospace",
    backgroundColor: colors.inputBackground,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    color: colors.text,
    fontSize: 14,
  },
  codeBlock: {
    fontFamily: "monospace",
    backgroundColor: colors.inputBackground,
    padding: 12,
    borderRadius: 6,
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
    marginVertical: 8,
  },

  hr: {
    borderBottomColor: colors.cardBorder,
    borderBottomWidth: 1,
    marginVertical: 12,
  },

  table: {
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: 4,
    marginVertical: 8,
  },
  tableHeader: {
    backgroundColor: colors.inputBackground,
    padding: 8,
    fontWeight: "600",
    color: colors.text,
  },
  tableCell: {
    padding: 8,
    color: colors.text,
    borderColor: colors.cardBorder,
    borderWidth: 0.5,
  },

  image: {
    borderRadius: 8,
    marginVertical: 8,
    width: undefined,
    height: 200,
  },
});
