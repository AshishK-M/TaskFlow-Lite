import { IsIn, IsString } from 'class-validator';
import { ASSIGNABLE_ROLES, type Role } from '../../common/constants/roles.constant';

export class AddMemberDto {
  @IsString()
  userId!: string;

  @IsIn(ASSIGNABLE_ROLES)
  role!: Role;
}
