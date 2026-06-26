import { IsIn, IsISO8601, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { TASK_PRIORITY_VALUES, TASK_STATUS_VALUES, type TaskPriority, type TaskStatus } from '../../common/constants/status.constant';

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsIn(TASK_STATUS_VALUES)
  status?: TaskStatus;

  @IsOptional()
  @IsIn(TASK_PRIORITY_VALUES)
  priority?: TaskPriority;

  @IsOptional()
  @IsString()
  assigneeId?: string | null;

  @IsOptional()
  @IsISO8601()
  dueDate?: string | null;
}
