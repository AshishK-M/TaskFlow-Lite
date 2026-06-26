import { IsIn } from 'class-validator';
import { ASSIGNABLE_ROLES, type Role } from '../../common/constants/roles.constant';

export class UpdateMemberDto {
  @IsIn(ASSIGNABLE_ROLES)
  role!: Role;
}
