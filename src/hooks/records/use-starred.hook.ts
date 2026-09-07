import type { MyRecord } from "../../types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { starredService } from "../../api";

export const useStarredRecords = () => {
  return useQuery<MyRecord[]>({
    queryKey: ["starred"],
    queryFn: () => starredService.getStarred().then((res) => res.data),
    staleTime: 1000 * 60 * 1,
  });
};

export const useAddStarred = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (recordId: string) =>
      starredService.addStarred(recordId).then((res) => res.data),
    onSuccess: (_, recordId) => {
      queryClient.invalidateQueries({ queryKey: ["records"] });
      queryClient.invalidateQueries({ queryKey: ["record", recordId] });
      queryClient.invalidateQueries({ queryKey: ["starred"] });
    },
  });
};

export const useRemoveStarred = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (recordId: string) =>
      starredService.removeStarred(recordId).then((res) => res.data),
    onSuccess: (_, recordId) => {
      queryClient.invalidateQueries({ queryKey: ["records"] });
      queryClient.invalidateQueries({ queryKey: ["record", recordId] });
      queryClient.invalidateQueries({ queryKey: ["starred"] });
    },
  });
};

export const useToggleStar = () => {
  const addMutation = useAddStarred();
  const removeMutation = useRemoveStarred();

  const toggleStar = (recordId: string, isStarred: boolean) => {
    if (isStarred) {
      return removeMutation.mutateAsync(recordId);
    } else {
      return addMutation.mutateAsync(recordId);
    }
  };

  return {
    toggleStar,
    isPending: addMutation.isPending || removeMutation.isPending,
  };
};
