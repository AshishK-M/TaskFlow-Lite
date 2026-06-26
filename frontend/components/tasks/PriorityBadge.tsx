import { Badge } from '@/components/ui/Badge';
import { TASK_PRIORITY_LABELS, type TaskPriority } from '@/constants/status';
import { priorityColor } from '@/utils/statusColor';

export const PriorityBadge = ({ priority }: { priority: TaskPriority }) => (
  <Badge tone={priorityColor[priority]}>{TASK_PRIORITY_LABELS[priority]}</Badge>
);
