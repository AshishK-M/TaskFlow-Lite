import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/types';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';

@Controller('boards/:boardId/tasks')
export class TasksController {
  constructor(private readonly tasks: TasksService) {}

  @Get()
  list(@Param('boardId') boardId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.tasks.listForBoard(boardId, user.id);
  }

  @Post()
  create(
    @Param('boardId') boardId: string,
    @Body() dto: CreateTaskDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.tasks.create(boardId, user.id, dto);
  }

  @Patch(':taskId')
  update(
    @Param('boardId') boardId: string,
    @Param('taskId') taskId: string,
    @Body() dto: UpdateTaskDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.tasks.update(boardId, taskId, user.id, dto);
  }

  @Delete(':taskId')
  remove(
    @Param('boardId') boardId: string,
    @Param('taskId') taskId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.tasks.remove(boardId, taskId, user.id);
  }
}
