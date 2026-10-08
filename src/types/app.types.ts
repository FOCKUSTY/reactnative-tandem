import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { MyRecord } from "./record.types";
import { Table } from "./table.types";

export type RootStackParameters = {
  Login: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token?: string };
  Main: undefined;
  Filters: undefined;
  Sections: undefined;
  Filter: undefined;
  Records: { sectionId: string; title: string };
  RecordDetail: { id: string };
  CreateRecord: { sectionId: string; record?: MyRecord };
  LinkPartner: undefined;
  Settings: undefined;
  Logs: undefined;
  Calendar: undefined;
  Reminders: undefined;
  Pin: undefined;
  Starred: undefined;
  EditProfile: undefined;
  Sessions: undefined;
  Tables: undefined;
  TableDetail: { tableId: string; tableName: string };
  CreateTable: { sectionId?: string; table?: Table };
  CellScreen: {
    tableId: string;
    rowId: string;
    fieldId: string;
    tableName?: string;
    mode?: "view" | "edit";
  };
  TemplateHelp: undefined;
  FormulaHelp: undefined;
};

export type NavigationProperty = NativeStackNavigationProp<RootStackParameters>;
