import { useState, useCallback } from "react";
import { RefreshControl, ScrollView, FlatList } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { useTheme } from "../contexts";
import { logger } from "../utils";

interface UseRefreshOptions {
  queryKeys?: string[][];
  onRefresh?: () => Promise<unknown> | unknown;
  enabled?: boolean;
}

export const useRefresh = (options: UseRefreshOptions = {}) => {
  const { queryKeys = [], onRefresh, enabled = true } = options;
  const { colors } = useTheme();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    if (!enabled) return;
    setRefreshing(true);
    try {
      if (onRefresh) await onRefresh();
      for (const keys of queryKeys) {
        await queryClient.invalidateQueries({ queryKey: keys });
      }
    } catch (error) {
      void logger.warn("Refresh error", {
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setRefreshing(false);
    }
  }, [queryClient, queryKeys, onRefresh, enabled]);

  const refreshControl = (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={handleRefresh}
      colors={[colors.primary]}
      tintColor={colors.primary}
    />
  );

  const withRefresh = <T extends object>(
    Component: React.ComponentType<T>,
    props: T & { refreshControl?: React.ReactNode },
  ) => {
    const ComponentWithRefresh = Component as any;
    return (
      <ComponentWithRefresh
        {...props}
        refreshControl={props.refreshControl || refreshControl}
      />
    );
  };

  const RefreshableScrollView = ({
    children,
    ...props
  }: React.ComponentProps<typeof ScrollView>) => (
    <ScrollView {...props} refreshControl={refreshControl}>
      {children}
    </ScrollView>
  );

  const RefreshableFlatList = <T extends any>({
    children,
    ...props
  }: React.ComponentProps<typeof FlatList<T>>) => (
    <FlatList<T> {...props} refreshControl={refreshControl}>
      {children}
    </FlatList>
  );

  return {
    refreshing,
    refreshControl,
    handleRefresh,
    withRefresh,
    RefreshableScrollView,
    RefreshableFlatList,
  };
};
