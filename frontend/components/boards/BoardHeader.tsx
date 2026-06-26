'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Dropdown } from '@/components/ui/Dropdown';
import { ROLE_LABELS } from '@/constants/roles';
import { RoleBadge } from '@/components/members/RoleBadge';
import { ROUTES } from '@/constants/routes';
import type { BoardDetail } from '@/types/board';

export type BoardHeaderProps = {
  board: BoardDetail;
  canEdit: boolean;
  canDelete: boolean;
  onEdit: () => void;
  onDelete: () => void;
};

export const BoardHeader = ({ board, canEdit, canDelete, onEdit, onDelete }: BoardHeaderProps) => {
  const menuItems = [
    ...(canEdit ? [{ label: 'Edit board', onClick: onEdit }] : []),
    ...(canDelete ? [{ label: 'Delete board', destructive: true, onClick: onDelete }] : []),
  ];

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between mb-6">
      <div>
        <Link
          href={ROUTES.boards}
          className="text-xs text-slate-500 hover:text-slate-700 inline-flex items-center gap-1"
        >
          ← All boards
        </Link>
        <div className="mt-1 flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-semibold text-slate-900">{board.name}</h1>
          <RoleBadge role={board.role} />
        </div>
        {board.description && (
          <p className="mt-1 text-sm text-slate-500 max-w-2xl">{board.description}</p>
        )}
        <p className="mt-1 text-xs text-slate-500">
          Owned by <span className="font-medium text-slate-700">{board.owner.name}</span> · Your role:{' '}
          {ROLE_LABELS[board.role]}
        </p>
      </div>
      {menuItems.length > 0 && (
        <Dropdown
          trigger={
            <Button variant="secondary" size="sm">
              Board actions ▾
            </Button>
          }
          items={menuItems}
        />
      )}
    </div>
  );
};
