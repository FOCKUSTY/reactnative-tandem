import { useMutation } from "@tanstack/react-query";
import { pushService } from "../api/services/push.service";

export const useSendPartnerMessage = () => {
  return useMutation({
    mutationFn: (message: string) =>
      pushService.sendToPartner({ message }).then((res) => res.data),
  });
};
