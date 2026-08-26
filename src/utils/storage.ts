import * as SecureStore from "expo-secure-store";

export const storage = {
  getItem: async (key: string) => SecureStore.getItemAsync(key),
  setItem: async (key: string, value: string) =>
    SecureStore.setItemAsync(key, value),
  deleteItem: async (key: string) => SecureStore.deleteItemAsync(key),
};
