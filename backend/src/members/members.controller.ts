import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/types';
import { AddMemberDto } from './dto/add-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { MembersService } from './members.service';

@Controller('boards/:boardId/members')
export class MembersController {
  constructor(private readonly members: MembersService) {}

  @Get()
  list(@Param('boardId') boardId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.members.list(boardId, user.id);
  }

  @Post()
  add(
    @Param('boardId') boardId: string,
    @Body() dto: AddMemberDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.members.add(boardId, user.id, dto);
  }

  @Patch(':memberId')
  updateRole(
    @Param('boardId') boardId: string,
    @Param('memberId') memberId: string,
    @Body() dto: UpdateMemberDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.members.updateRole(boardId, memberId, user.id, dto);
  }

  @Delete(':memberId')
  remove(
    @Param('boardId') boardId: string,
    @Param('memberId') memberId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.members.remove(boardId, memberId, user.id);
  }
}
