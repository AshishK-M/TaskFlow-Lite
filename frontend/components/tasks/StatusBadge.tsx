import { Badge } from '@/components/ui/Badge';
import { TASK_STATUS_LABELS, type TaskStatus } from '@/constants/status';
import { statusColor } from '@/utils/statusColor';

export const StatusBadge = ({ status }: { status: TaskStatus }) => (
  <Badge tone={statusColor[status]}>{TASK_STATUS_LABELS[status]}</Badge>
);
