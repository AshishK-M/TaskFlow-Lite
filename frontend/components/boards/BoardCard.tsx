import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Card, CardBody } from '@/components/ui/Card';
import { ROUTES } from '@/constants/routes';
import { ROLE_LABELS } from '@/constants/roles';
import { roleColor } from '@/utils/statusColor';
import { truncateText } from '@/utils/truncateText';
import type { BoardSummary } from '@/types/board';

export const BoardCard = ({ board }: { board: BoardSummary }) => (
  <Link href={ROUTES.board(board.id)} className="block group">
    <Card className="h-full transition shadow-soft group-hover:shadow-md group-hover:border-brand-200">
      <CardBody className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold text-slate-900 group-hover:text-brand-700 line-clamp-2">
            {board.name}
          </h3>
          <Badge tone={roleColor[board.role]}>{ROLE_LABELS[board.role]}</Badge>
        </div>
        <p className="text-sm text-slate-500 min-h-[2.5rem]">
          {truncateText(board.description, 140) || 'No description yet.'}
        </p>
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>
            {board._count.tasks} task{board._count.tasks === 1 ? '' : 's'}
          </span>
          <span>
            {board._count.members} member{board._count.members === 1 ? '' : 's'}
          </span>
        </div>
      </CardBody>
    </Card>
  </Link>
);
