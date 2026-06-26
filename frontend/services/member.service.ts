import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/constants/api';
import type { AddMemberInput, Member, UpdateMemberInput } from '@/types/member';
import type { User } from '@/types/auth';

export const memberService = {
  async list(boardId: string): Promise<Member[]> {
    const { data } = await api.get<Member[]>(API_ENDPOINTS.members.list(boardId));
    return data;
  },
  async add(boardId: string, input: AddMemberInput): Promise<Member> {
    const { data } = await api.post<Member>(API_ENDPOINTS.members.list(boardId), input);
    return data;
  },
  async updateRole(boardId: string, memberId: string, input: UpdateMemberInput): Promise<Member> {
    const { data } = await api.patch<Member>(
      API_ENDPOINTS.members.detail(boardId, memberId),
      input,
    );
    return data;
  },
  async remove(boardId: string, memberId: string): Promise<{ id: string }> {
    const { data } = await api.delete<{ id: string }>(
      API_ENDPOINTS.members.detail(boardId, memberId),
    );
    return data;
  },
  async searchUsers(query: string): Promise<User[]> {
    const { data } = await api.get<User[]>(API_ENDPOINTS.users.search(query));
    return data;
  },
};
