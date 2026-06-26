import { Badge } from '@/components/ui/Badge';
import { ROLE_LABELS, type Role } from '@/constants/roles';
import { roleColor } from '@/utils/statusColor';

export const RoleBadge = ({ role }: { role: Role }) => (
  <Badge tone={roleColor[role]}>{ROLE_LABELS[role]}</Badge>
);
