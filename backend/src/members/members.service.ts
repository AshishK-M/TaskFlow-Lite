import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ROLES } from '../common/constants/roles.constant';
import { Permissions } from '../common/utils/permissions.util';
import { MembershipService } from '../boards/membership.service';
import { AddMemberDto } from './dto/add-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';

@Injectable()
export class MembersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly membership: MembershipService,
  ) {}

  async list(boardId: string, userId: string) {
    await this.membership.resolveRole(boardId, userId);
    return this.prisma.boardMember.findMany({
      where: { boardId },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async add(boardId: string, actorId: string, dto: AddMemberDto) {
    const role = await this.membership.resolveRole(boardId, actorId);
    if (!Permissions.canManageMembers({ role })) {
      throw new ForbiddenException('You cannot manage members of this board');
    }

    const user = await this.prisma.user.findUnique({ where: { id: dto.userId } });
    if (!user) throw new NotFoundException('User not found');

    const exists = await this.prisma.boardMember.findUnique({
      where: { boardId_userId: { boardId, userId: dto.userId } },
    });
    if (exists) throw new ConflictException('User is already a member');

    return this.prisma.boardMember.create({
      data: { boardId, userId: dto.userId, role: dto.role },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  }

  async updateRole(boardId: string, memberId: string, actorId: string, dto: UpdateMemberDto) {
    const role = await this.membership.resolveRole(boardId, actorId);
    if (!Permissions.canManageMembers({ role })) {
      throw new ForbiddenException('You cannot manage members of this board');
    }
    const target = await this.requireMember(boardId, memberId);
    if (target.role === ROLES.OWNER) {
      throw new BadRequestException("The owner's role cannot be changed");
    }
    return this.prisma.boardMember.update({
      where: { id: memberId },
      data: { role: dto.role },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  }

  async remove(boardId: string, memberId: string, actorId: string) {
    const role = await this.membership.resolveRole(boardId, actorId);
    if (!Permissions.canManageMembers({ role })) {
      throw new ForbiddenException('You cannot manage members of this board');
    }
    const target = await this.requireMember(boardId, memberId);
    if (target.role === ROLES.OWNER) {
      throw new BadRequestException('The owner cannot be removed');
    }
    await this.prisma.boardMember.delete({ where: { id: memberId } });
    return { id: memberId };
  }

  private async requireMember(boardId: string, memberId: string) {
    const member = await this.prisma.boardMember.findUnique({ where: { id: memberId } });
    if (!member || member.boardId !== boardId) throw new NotFoundException('Member not found');
    return member;
  }
}
