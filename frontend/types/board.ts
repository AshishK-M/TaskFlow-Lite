import type { Role } from '@/constants/roles';
import type { User } from './auth';
import type { Member } from './member';

export type BoardSummary = {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  role: Role;
  owner: User;
  _count: { tasks: number; members: number };
};

export type BoardDetail = BoardSummary & {
  members: Member[];
};

export type CreateBoardInput = {
  name: string;
  description?: string;
};

export type UpdateBoardInput = Partial<CreateBoardInput>;
