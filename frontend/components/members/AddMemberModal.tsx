'use client';

import { useEffect, useState } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { Spinner } from '@/components/ui/Spinner';
import { ASSIGNABLE_ROLES, ROLES, ROLE_LABELS, type Role } from '@/constants/roles';
import { MESSAGES } from '@/constants/messages';
import { useDebounce } from '@/hooks/useDebounce';
import { memberService } from '@/services/member.service';
import type { User } from '@/types/auth';
import type { Member } from '@/types/member';
import { FormField } from '@/components/forms/FormField';

export type AddMemberModalProps = {
  open: boolean;
  onClose: () => void;
  existingMembers: Member[];
  onAdd: (userId: string, role: Role) => Promise<void>;
};

const roleOptions = ASSIGNABLE_ROLES.map((r) => ({ value: r, label: ROLE_LABELS[r] }));

export const AddMemberModal = ({ open, onClose, existingMembers, onAdd }: AddMemberModalProps) => {
  const [query, setQuery] = useState('');
  const debounced = useDebounce(query, 250);
  const [results, setResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<User | null>(null);
  const [role, setRole] = useState<Role>(ROLES.EDITOR);
  const [submitting, setSubmitting] = useState(false);

  // Reset whenever the modal is reopened
  useEffect(() => {
    if (open) {
      setQuery('');
      setResults([]);
      setSelected(null);
      setRole(ROLES.EDITOR);
    }
  }, [open]);

  useEffect(() => {
    if (!debounced.trim()) {
      setResults([]);
      return;
    }
    let cancelled = false;
    setSearching(true);
    memberService
      .searchUsers(debounced)
      .then((users) => {
        if (!cancelled) setResults(users);
      })
      .catch(() => {
        if (!cancelled) setResults([]);
      })
      .finally(() => {
        if (!cancelled) setSearching(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debounced]);

  const memberIds = new Set(existingMembers.map((m) => m.userId));
  const candidates = results.filter((u) => !memberIds.has(u.id));

  const submit = async () => {
    if (!selected) return;
    try {
      setSubmitting(true);
      await onAdd(selected.id, role);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add a member"
      description="Search by name or email and choose a role."
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={submit} loading={submitting} disabled={!selected}>
            Add member
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <FormField label="Search">
          <Input
            placeholder="Name or email"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelected(null);
            }}
            autoFocus
          />
        </FormField>

        <div className="rounded-md border border-slate-200 max-h-60 overflow-auto">
          {searching && (
            <div className="flex items-center justify-center py-6 text-slate-400">
              <Spinner />
            </div>
          )}
          {!searching && debounced && candidates.length === 0 && (
            <p className="px-3 py-6 text-sm text-center text-slate-500">{MESSAGES.empty.search}</p>
          )}
          {!searching && !debounced && (
            <p className="px-3 py-6 text-sm text-center text-slate-400">Start typing to search.</p>
          )}
          {!searching && candidates.map((user) => {
            const isSelected = selected?.id === user.id;
            return (
              <button
                key={user.id}
                type="button"
                onClick={() => setSelected(user)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-left border-t border-slate-100 first:border-t-0 ${
                  isSelected ? 'bg-brand-50' : 'hover:bg-slate-50'
                }`}
              >
                <Avatar name={user.name} size="sm" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{user.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                </div>
              </button>
            );
          })}
        </div>

        <FormField label="Role">
          <Select
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            options={roleOptions}
          />
        </FormField>
      </div>
    </Modal>
  );
};
