import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ROLES } from '../common/constants/roles.constant';
import { Permissions } from '../common/utils/permissions.util';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { MembershipService } from './membership.service';

@Injectable()
export class BoardsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly membership: MembershipService,
  ) {}

  async listForUser(userId: string) {
    const memberships = await this.prisma.boardMember.findMany({
      where: { userId },
      include: {
        board: {
          include: {
            _count: { select: { tasks: true, members: true } },
            owner: { select: { id: true, name: true, email: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return memberships.map((m) => ({
      ...m.board,
      role: m.role,
    }));
  }

  async getById(boardId: string, userId: string) {
    const role = await this.membership.resolveRole(boardId, userId);
    const board = await this.prisma.board.findUniqueOrThrow({
      where: { id: boardId },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: {
          include: { user: { select: { id: true, name: true, email: true } } },
          orderBy: { createdAt: 'asc' },
        },
        _count: { select: { tasks: true, members: true } },
      },
    });
    return { ...board, role };
  }

  async create(dto: CreateBoardDto, userId: string) {
    return this.prisma.board.create({
      data: {
        name: dto.name,
        description: dto.description ?? null,
        ownerId: userId,
        members: { create: { userId, role: ROLES.OWNER } },
      },
      include: {
        _count: { select: { tasks: true, members: true } },
        owner: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async update(boardId: string, userId: string, dto: UpdateBoardDto) {
    const role = await this.membership.resolveRole(boardId, userId);
    if (!Permissions.canUpdateBoard({ role })) {
      throw new ForbiddenException('You cannot update this board');
    }
    return this.prisma.board.update({
      where: { id: boardId },
      data: dto,
      include: {
        _count: { select: { tasks: true, members: true } },
        owner: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async remove(boardId: string, userId: string) {
    const role = await this.membership.resolveRole(boardId, userId);
    if (!Permissions.canDeleteBoard({ role })) {
      throw new ForbiddenException('Only the owner can delete a board');
    }
    await this.prisma.board.delete({ where: { id: boardId } });
    return { id: boardId };
  }
}
