import { IsIn, IsISO8601, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { TASK_PRIORITY, TASK_PRIORITY_VALUES, TASK_STATUS, TASK_STATUS_VALUES, type TaskPriority, type TaskStatus } from '../../common/constants/status.constant';

export class CreateTaskDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsIn(TASK_STATUS_VALUES)
  status?: TaskStatus = TASK_STATUS.TODO;

  @IsOptional()
  @IsIn(TASK_PRIORITY_VALUES)
  priority?: TaskPriority = TASK_PRIORITY.MEDIUM;

  @IsOptional()
  @IsString()
  assigneeId?: string;

  @IsOptional()
  @IsISO8601()
  dueDate?: string;
}
