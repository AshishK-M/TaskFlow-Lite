import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/constants/api';
import type { CreateTaskInput, Task, UpdateTaskInput } from '@/types/task';

export const taskService = {
  async list(boardId: string): Promise<Task[]> {
    const { data } = await api.get<Task[]>(API_ENDPOINTS.tasks.list(boardId));
    return data;
  },
  async create(boardId: string, input: CreateTaskInput): Promise<Task> {
    const { data } = await api.post<Task>(API_ENDPOINTS.tasks.list(boardId), input);
    return data;
  },
  async update(boardId: string, taskId: string, input: UpdateTaskInput): Promise<Task> {
    const { data } = await api.patch<Task>(API_ENDPOINTS.tasks.detail(boardId, taskId), input);
    return data;
  },
  async remove(boardId: string, taskId: string): Promise<{ id: string }> {
    const { data } = await api.delete<{ id: string }>(API_ENDPOINTS.tasks.detail(boardId, taskId));
    return data;
  },
};
