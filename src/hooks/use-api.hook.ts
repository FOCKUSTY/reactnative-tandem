import type { ApiError, UseApiResult } from "../types";

import { useState, useCallback } from "react";
import { handleApiError } from "../utils";

export function useApi<T, P extends any[] = any[]>(
  apiCall: (...args: P) => Promise<T>,
): UseApiResult<T> & { execute: (...args: P) => Promise<T> } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const execute = useCallback(
    async (...args: P) => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiCall(...args);
        setData(response);
        return response;
      } catch (err) {
        const apiError = handleApiError(err);
        setError(apiError);
        throw apiError;
      } finally {
        setLoading(false);
      }
    },
    [apiCall],
  );

  return { data, loading, error, execute };
}
