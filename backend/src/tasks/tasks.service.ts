import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MembershipService } from '../boards/membership.service';
import { Permissions } from '../common/utils/permissions.util';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

const taskInclude = {
  assignee: { select: { id: true, name: true, email: true } },
  createdBy: { select: { id: true, name: true, email: true } },
};

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly membership: MembershipService,
  ) {}

  async listForBoard(boardId: string, userId: string) {
    await this.membership.resolveRole(boardId, userId);
    return this.prisma.task.findMany({
      where: { boardId },
      include: taskInclude,
      orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async create(boardId: string, userId: string, dto: CreateTaskDto) {
    const role = await this.membership.resolveRole(boardId, userId);
    if (!Permissions.canCreateTask({ role })) {
      throw new ForbiddenException('You cannot create tasks on this board');
    }
    await this.assertAssignableMember(boardId, dto.assigneeId ?? null);

    return this.prisma.task.create({
      data: {
        boardId,
        title: dto.title,
        description: dto.description ?? null,
        status: dto.status ?? 'TODO',
        priority: dto.priority ?? 'MEDIUM',
        assigneeId: dto.assigneeId ?? null,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        createdById: userId,
      },
      include: taskInclude,
    });
  }

  async update(boardId: string, taskId: string, userId: string, dto: UpdateTaskDto) {
    const task = await this.getTaskInBoard(boardId, taskId);
    const role = await this.membership.resolveRole(boardId, userId);
    if (!Permissions.canUpdateTask({ role, isOwner: task.createdById === userId })) {
      throw new ForbiddenException('You cannot update this task');
    }
    if (dto.assigneeId !== undefined) {
      await this.assertAssignableMember(boardId, dto.assigneeId);
    }
    return this.prisma.task.update({
      where: { id: taskId },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.priority !== undefined && { priority: dto.priority }),
        ...(dto.assigneeId !== undefined && { assigneeId: dto.assigneeId }),
        ...(dto.dueDate !== undefined && {
          dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        }),
      },
      include: taskInclude,
    });
  }

  async remove(boardId: string, taskId: string, userId: string) {
    const task = await this.getTaskInBoard(boardId, taskId);
    const role = await this.membership.resolveRole(boardId, userId);
    if (!Permissions.canDeleteTask({ role, isOwner: task.createdById === userId })) {
      throw new ForbiddenException('You cannot delete this task');
    }
    await this.prisma.task.delete({ where: { id: taskId } });
    return { id: taskId };
  }

  private async getTaskInBoard(boardId: string, taskId: string) {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task || task.boardId !== boardId) throw new NotFoundException('Task not found');
    return task;
  }

  private async assertAssignableMember(boardId: string, assigneeId: string | null): Promise<void> {
    if (!assigneeId) return;
    const member = await this.prisma.boardMember.findUnique({
      where: { boardId_userId: { boardId, userId: assigneeId } },
    });
    if (!member) throw new ForbiddenException('Assignee is not a member of this board');
  }
}
