'use client';

import { Avatar } from '@/components/ui/Avatar';
import { Dropdown } from '@/components/ui/Dropdown';
import { Select } from '@/components/ui/Select';
import { ASSIGNABLE_ROLES, ROLES, ROLE_LABELS, type Role } from '@/constants/roles';
import type { Member } from '@/types/member';
import { RoleBadge } from './RoleBadge';

export type MemberRowProps = {
  member: Member;
  isCurrentUser: boolean;
  canManage: boolean;
  onRoleChange: (member: Member, role: Role) => void;
  onRemove: (member: Member) => void;
};

const roleOptions = ASSIGNABLE_ROLES.map((r) => ({ value: r, label: ROLE_LABELS[r] }));

export const MemberRow = ({
  member,
  isCurrentUser,
  canManage,
  onRoleChange,
  onRemove,
}: MemberRowProps) => {
  const isOwner = member.role === ROLES.OWNER;
  const editable = canManage && !isOwner;

  return (
    <div className="flex items-center justify-between gap-3 py-3 px-3 rounded-lg hover:bg-slate-50">
      <div className="flex items-center gap-3 min-w-0">
        <Avatar name={member.user.name} size="sm" />
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-900 truncate">
            {member.user.name}
            {isCurrentUser && <span className="ml-1 text-xs text-slate-400">(you)</span>}
          </p>
          <p className="text-xs text-slate-500 truncate">{member.user.email}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {editable ? (
          <Select
            className="h-8 text-xs w-32"
            value={member.role}
            options={roleOptions}
            onChange={(e) => onRoleChange(member, e.target.value as Role)}
          />
        ) : (
          <RoleBadge role={member.role} />
        )}
        {editable && (
          <Dropdown
            trigger={
              <span className="inline-flex h-8 w-8 items-center justify-center rounded hover:bg-slate-100 text-slate-500">
                ⋯
              </span>
            }
            items={[
              { label: 'Remove from board', destructive: true, onClick: () => onRemove(member) },
            ]}
          />
        )}
      </div>
    </div>
  );
};
