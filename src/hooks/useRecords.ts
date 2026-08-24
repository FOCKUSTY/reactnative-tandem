import type { MyRecord, Section } from '../types';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';

export const useRecords = (section: Section) => {
  return useQuery<MyRecord[]>({
    queryKey: ['records', section],
    queryFn: async () => {
      const response = await api.get<MyRecord[]>(`/records?section=${section}`);
      return response.data;
    },
    enabled: !!section,
  });
};

export const useUpdates = (since?: string) => {
  return useQuery<MyRecord[]>({
    queryKey: ['updates', since],
    queryFn: async () => {
      const response = await api.get<MyRecord[]>(`/records/updates?since=${since || ''}`);
      return response.data;
    },
    enabled: false,
  });
};

export const useCreateRecord = () => {
  const queryClient = useQueryClient();
  return useMutation<MyRecord, Error, Omit<MyRecord, 'id' | 'createdAt' | 'updatedAt' | 'userId'>>({
    mutationFn: (newRecord) => api.post('/records', newRecord).then(res => res.data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['records', variables.section] });
    },
  });
};

export const useUpdateRecord = () => {
  const queryClient = useQueryClient();
  return useMutation<MyRecord, Error, { id: number; section: Section; data: Partial<Omit<MyRecord, 'id' | 'userId'>> }>({
    mutationFn: ({ id, data }) => api.patch(`/records/${id}`, data).then(res => res.data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['records', variables.section] });
    },
  });
};

export const useDeleteRecord = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: (id) => api.delete(`/records/${id}`).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records'] });
    },
  });
};