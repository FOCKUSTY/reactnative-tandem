import * as Linking from "expo-linking";
import type { LinkingOptions } from "@react-navigation/native";
import type { RootStackParameters } from "../types";

export const linking: LinkingOptions<RootStackParameters> = {
  prefixes: [
    Linking.createURL("/"),
    "tandem://",
    "https://tandem-links.vercel.app",
  ],
  config: {
    screens: {
      Main: {
        screens: {
          HOME: "home",
          SECTIONS: "sections",
          TABLES: "tables",
          SETTINGS: "settings",
        },
      },

      Login: "login",
      LinkPartner: "link-partner",

      ForgotPassword: "forgot-password",
      ResetPassword: {
        path: "reset-password",
        parse: {
          token: String,
        },
      },

      RecordDetail: "record/:id",
      CreateRecord: {
        path: "record/new/:sectionId?",
        parse: { sectionId: (v) => v || undefined },
      },
      Records: {
        path: "section/:sectionId",
        parse: { title: String },
      },
      Starred: "starred",
      Calendar: "calendar",
      Reminders: "reminders",

      TableDetail: "table/:tableId",
      CreateTable: {
        path: "table/new",
        parse: { sectionId: (v) => v || undefined },
      },
      CellScreen: {
        path: "table/:tableId/cell/:rowId/:fieldId",
        parse: {
          mode: (v) => (v === "edit" ? "edit" : "view"),
        },
      },

      EditProfile: "profile",
      Logs: "logs",
      Settings: "settings-full",
    },
  },
};
