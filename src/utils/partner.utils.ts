import type { MeResponse } from "../types";

export const getPartner = (me?: MeResponse | null) => {
  if (!me) {
    return null;
  }

  if (!me.pair) {
    return null;
  }

  if (me.pair.userA.id !== me.id) {
    return me.pair.userA;
  }

  return me.pair.userB;
};
