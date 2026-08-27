import { useQuery } from "@tanstack/react-query";
import { recordsService } from "../api/services/records.service";

export const useRecord = (id: string) => {
  return useQuery({
    queryKey: ["record", id],
    queryFn: () => recordsService.getRecordById(id).then((res) => res.data),
    enabled: !!id,
  });
};
