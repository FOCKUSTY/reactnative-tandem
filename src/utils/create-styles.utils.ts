import {
  StyleSheet,
  type ImageStyle,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { ThemeColors } from "../constants";
import { CommonStyles, commonStyles } from "../styles";

type NamedStyles<T> = { [P in keyof T]: ViewStyle | TextStyle | ImageStyle };

export const createStyles = <T extends NamedStyles<T> | NamedStyles<any>>(
  styles: (colors: ThemeColors) => T & NamedStyles<any>,
): ((colors: ThemeColors) => T & NamedStyles<any> & CommonStyles) => {
  return (colors: ThemeColors) => {
    return StyleSheet.create({
      ...commonStyles(colors),
      ...styles(colors),
    });
  };
};
