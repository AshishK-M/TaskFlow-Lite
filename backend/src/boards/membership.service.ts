import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { type Role, ROLES } from '../common/constants/roles.constant';

@Injectable()
export class MembershipService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Returns the actor's role on the board. Throws 404 if the board does not
   * exist and 403 if the actor is not a member.
   */
  async requireRole(boardId: string, userId: string): Promise<Role> {
    const board = await this.prisma.board.findUnique({ where: { id: boardId } });
    if (!board) throw new NotFoundException('Board not found');

    const membership = await this.prisma.boardMember.findUnique({
      where: { boardId_userId: { boardId, userId } },
    });
    if (!membership) throw new ForbiddenException('You are not a member of this board');
    return membership.role as Role;
  }

  /**
   * Like requireRole but allows the board owner to act even if their
   * BoardMember row was somehow removed. Returns the effective role.
   */
  async resolveRole(boardId: string, userId: string): Promise<Role> {
    const board = await this.prisma.board.findUnique({ where: { id: boardId } });
    if (!board) throw new NotFoundException('Board not found');

    if (board.ownerId === userId) return ROLES.OWNER;

    const membership = await this.prisma.boardMember.findUnique({
      where: { boardId_userId: { boardId, userId } },
    });
    if (!membership) throw new ForbiddenException('You are not a member of this board');
    return membership.role as Role;
  }
}
