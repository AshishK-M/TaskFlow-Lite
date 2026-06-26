'use client';

import { EmptyState } from '@/components/ui/EmptyState';
import { MESSAGES } from '@/constants/messages';
import type { Role } from '@/constants/roles';
import type { Member } from '@/types/member';
import { MemberRow } from './MemberRow';

export type MemberListProps = {
  members: Member[];
  currentUserId: string;
  canManage: boolean;
  onRoleChange: (member: Member, role: Role) => void;
  onRemove: (member: Member) => void;
};

export const MemberList = ({ members, currentUserId, canManage, onRoleChange, onRemove }: MemberListProps) => {
  if (members.length === 0) {
    return <EmptyState title="No members" description={MESSAGES.empty.members} />;
  }
  return (
    <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
      {members.map((member) => (
        <MemberRow
          key={member.id}
          member={member}
          isCurrentUser={member.userId === currentUserId}
          canManage={canManage}
          onRoleChange={onRoleChange}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
};
