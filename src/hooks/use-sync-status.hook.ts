import { useIsFetching, useIsMutating } from "@tanstack/react-query";

export const useSyncStatus = () => {
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();
  const isSyncing = isFetching > 0 || isMutating > 0;

  return {
    isSyncing,
    isFetching,
    isMutating,
  };
};
