import { useQuery } from "@tanstack/react-query";
import { recordsService } from "../../api";
import { applyTemplatesToRecord } from "../../template";

export const useRecord = (id: string) => {
  return useQuery({
    queryKey: ["record", id],
    queryFn: async () => {
      const res = await recordsService.getRecordById(id);
      return applyTemplatesToRecord(res.data);
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 1,
  });
};
