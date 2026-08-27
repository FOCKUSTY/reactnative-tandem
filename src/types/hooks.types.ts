import type { ApiError } from "./api.types";

export type UseApiResult<T> = {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  execute: (...args: any[]) => Promise<T>;
};
