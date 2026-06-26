import type { Role } from '@/constants/roles';
import type { User } from './auth';

export type Member = {
  id: string;
  boardId: string;
  userId: string;
  role: Role;
  createdAt: string;
  user: User;
};

export type AddMemberInput = {
  userId: string;
  role: Role;
};

export type UpdateMemberInput = {
  role: Role;
};
