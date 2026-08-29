import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { MyRecord } from "./record.types";

export type RootStackParameters = {
  Login: undefined;
  Main: undefined;
  Filters: undefined;
  Filter: undefined;
  Records: { sectionId: string; title: string };
  RecordDetail: { id: string };
  CreateRecord: { sectionId: string; record?: MyRecord };
  LinkPartner: undefined;
  Settings: undefined;
  Logs: undefined;
  Calendar: undefined;
  Pin: undefined;
};

export type NavigationProperty = NativeStackNavigationProp<RootStackParameters>;
