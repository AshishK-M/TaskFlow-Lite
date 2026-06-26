import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class SignupDto {
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(60)
  name!: string;

  @IsString()
  @MinLength(6)
  @MaxLength(128)
  password!: string;
}
