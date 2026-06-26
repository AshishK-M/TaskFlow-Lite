import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/constants/api';
import type {
  BoardDetail,
  BoardSummary,
  CreateBoardInput,
  UpdateBoardInput,
} from '@/types/board';

export const boardService = {
  async list(): Promise<BoardSummary[]> {
    const { data } = await api.get<BoardSummary[]>(API_ENDPOINTS.boards.list);
    return data;
  },
  async get(id: string): Promise<BoardDetail> {
    const { data } = await api.get<BoardDetail>(API_ENDPOINTS.boards.detail(id));
    return data;
  },
  async create(input: CreateBoardInput): Promise<BoardSummary> {
    const { data } = await api.post<BoardSummary>(API_ENDPOINTS.boards.list, input);
    return data;
  },
  async update(id: string, input: UpdateBoardInput): Promise<BoardSummary> {
    const { data } = await api.patch<BoardSummary>(API_ENDPOINTS.boards.detail(id), input);
    return data;
  },
  async remove(id: string): Promise<{ id: string }> {
    const { data } = await api.delete<{ id: string }>(API_ENDPOINTS.boards.detail(id));
    return data;
  },
};
