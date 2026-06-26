import { IsEnum, IsString } from 'class-validator';
import { ASSIGNABLE_ROLES, type Role } from '../../common/constants/roles.constant';

export class AddMemberDto {
  @IsString()
  userId!: string;

  @IsEnum(ASSIGNABLE_ROLES)
  role!: Role;
}
