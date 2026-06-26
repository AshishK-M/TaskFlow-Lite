'use client';

import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { MESSAGES } from '@/constants/messages';
import type { Role } from '@/constants/roles';
import { useAuth } from '@/hooks/useAuth';
import { useApiAction } from '@/hooks/useApiErrorToast';
import { useMembers } from '@/hooks/useMembers';
import { useModal } from '@/hooks/useModal';
import { usePermissions } from '@/hooks/usePermissions';
import type { Member } from '@/types/member';
import { AddMemberModal } from './AddMemberModal';
import { MemberList } from './MemberList';

export type BoardMembersPanelProps = {
  boardId: string;
  role: Role;
  initialMembers: Member[];
  onMembersChange: (members: Member[]) => void;
};

export const BoardMembersPanel = ({
  boardId,
  role,
  initialMembers,
  onMembersChange,
}: BoardMembersPanelProps) => {
  const { user } = useAuth();
  const can = usePermissions(role);
  const action = useApiAction();
  const addModal = useModal();
  const removeModal = useModal<Member>();

  const { data, loading, error, refetch, add, updateRole, remove } = useMembers(boardId);
  const members = data ?? initialMembers;

  const sync = (next: Member[] | null) => {
    if (next) onMembersChange(next);
  };

  const handleAdd = action(
    async (userId: string, newRole: Role) => {
      const created = await add({ userId, role: newRole });
      sync([...(data ?? initialMembers), created]);
      return created;
    },
    { success: MESSAGES.success.memberAdded },
  );

  const handleRoleChange = action(
    async (member: Member, newRole: Role) => {
      const updated = await updateRole(member.id, { role: newRole });
      sync((data ?? initialMembers).map((m) => (m.id === member.id ? updated : m)));
      return updated;
    },
    { success: MESSAGES.success.memberRoleUpdated },
  );

  const handleRemove = action(
    async (member: Member) => {
      await remove(member.id);
      sync((data ?? initialMembers).filter((m) => m.id !== member.id));
    },
    { success: MESSAGES.success.memberRemoved },
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {members.length} member{members.length === 1 ? '' : 's'}
        </p>
        {can.manageMembers() && <Button onClick={() => addModal.show()}>Add member</Button>}
      </div>

      {loading && !data && (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      )}

      {!loading && error && <ErrorState message={error} onRetry={() => void refetch()} />}

      {!error && (
        <MemberList
          members={members}
          currentUserId={user?.id ?? ''}
          canManage={can.manageMembers()}
          onRoleChange={(member, newRole) => {
            void handleRoleChange(member, newRole);
          }}
          onRemove={(member) => removeModal.show(member)}
        />
      )}

      <AddMemberModal
        open={addModal.open}
        onClose={addModal.hide}
        existingMembers={members}
        onAdd={async (userId, newRole) => {
          await handleAdd(userId, newRole);
        }}
      />

      <ConfirmModal
        open={removeModal.open}
        title="Remove member"
        description={
          removeModal.data ? (
            <>
              Remove <strong>{removeModal.data.user.name}</strong> from this board? They will lose
              access immediately.
            </>
          ) : null
        }
        destructive
        confirmLabel="Remove"
        onConfirm={async () => {
          if (removeModal.data) await handleRemove(removeModal.data);
        }}
        onClose={removeModal.hide}
      />
    </div>
  );
};
