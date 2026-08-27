import {
  StyleSheet,
  type ImageStyle,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { ThemeColors } from "../constants";

type NamedStyles<T> = { [P in keyof T]: ViewStyle | TextStyle | ImageStyle };

export const createStyles = <T extends NamedStyles<T> | NamedStyles<any>>(
  styles: (colors: ThemeColors) => T & NamedStyles<any>,
) => {
  return (colors: ThemeColors) => {
    return StyleSheet.create(styles(colors));
  };
};
