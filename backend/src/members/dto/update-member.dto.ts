import { IsEnum } from 'class-validator';
import { ASSIGNABLE_ROLES, type Role } from '../../common/constants/roles.constant';

export class UpdateMemberDto {
  @IsEnum(ASSIGNABLE_ROLES)
  role!: Role;
}
