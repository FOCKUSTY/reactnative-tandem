import {
  useMutation,
  useQueryClient,
  UseMutationOptions,
} from "@tanstack/react-query";

/**
 * Фабрика для создания хука создания сущности
 * @param mutationFn - функция, выполняющая запрос на создание (принимает данные и возвращает Promise с результатом)
 * @param queryKey - ключ для инвалидации кеша после успешного создания
 * @param options - дополнительные опции для useMutation
 * @returns useMutation-хук с типизированными параметрами
 */
export function useCreate<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  queryKey: string[],
  options?: Omit<UseMutationOptions<TData, Error, TVariables>, "mutationFn">,
) {
  const queryClient = useQueryClient();
  return useMutation<TData, Error, TVariables>({
    mutationFn,
    onSuccess: (data, variables, result, context) => {
      queryClient.invalidateQueries({ queryKey });
      options?.onSuccess?.(data, variables, result, context);
    },
    ...options,
  });
}

/**
 * Фабрика для создания хука обновления сущности
 * @param mutationFn - функция, выполняющая запрос на обновление (принимает { id, data } и возвращает Promise)
 * @param queryKey - ключ для инвалидации кеша после успешного обновления
 * @param options - дополнительные опции для useMutation
 */
export function useUpdate<TData, TVariables extends { id: string }>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  queryKey: string[],
  options?: Omit<UseMutationOptions<TData, Error, TVariables>, "mutationFn">,
) {
  const queryClient = useQueryClient();
  return useMutation<TData, Error, TVariables>({
    mutationFn,
    onSuccess: (data, variables, result, context) => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: [...queryKey, variables.id] });
      options?.onSuccess?.(data, variables, result, context);
    },
    ...options,
  });
}

/**
 * Фабрика для создания хука удаления сущности
 * @param mutationFn - функция, выполняющая запрос на удаление (принимает id и возвращает Promise)
 * @param queryKey - ключ для инвалидации кеша после успешного удаления
 * @param options - дополнительные опции для useMutation
 */
export function useDelete<TData = void>(
  mutationFn: (id: string) => Promise<TData>,
  queryKey: string[],
  options?: Omit<UseMutationOptions<TData, Error, string>, "mutationFn">,
) {
  const queryClient = useQueryClient();
  return useMutation<TData, Error, string>({
    mutationFn,
    onSuccess: (data, id, result, context) => {
      queryClient.invalidateQueries({ queryKey });
      // Удаляем кеш конкретной записи, если он есть
      queryClient.removeQueries({ queryKey: [...queryKey, id] });
      options?.onSuccess?.(data, id, result, context);
    },
    ...options,
  });
}
