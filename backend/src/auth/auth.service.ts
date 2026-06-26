import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthenticatedUser, JwtPayload } from '../common/types';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';

type AuthResult = { user: AuthenticatedUser; token: string };

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async signup(dto: SignupDto): Promise<AuthResult> {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    const password = await bcrypt.hash(dto.password, 10);
    const created = await this.prisma.user.create({
      data: { email: dto.email, name: dto.name, password },
      select: { id: true, email: true, name: true },
    });
    return { user: created, token: this.sign(created) };
  }

  async login(dto: LoginDto): Promise<AuthResult> {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(dto.password, user.password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const safe: AuthenticatedUser = { id: user.id, email: user.email, name: user.name };
    return { user: safe, token: this.sign(safe) };
  }

  private sign(user: AuthenticatedUser): string {
    const payload: JwtPayload = { sub: user.id, email: user.email };
    return this.jwt.sign(payload);
  }
}
