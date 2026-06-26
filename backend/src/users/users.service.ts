import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  search(query: string, excludeUserId?: string) {
    const q = query.trim();
    if (!q) return Promise.resolve([]);
    return this.prisma.user.findMany({
      where: {
        AND: [
          excludeUserId ? { NOT: { id: excludeUserId } } : {},
          {
            OR: [
              { email: { contains: q } },
              { name: { contains: q } },
            ],
          },
        ],
      },
      select: { id: true, email: true, name: true },
      take: 10,
    });
  }
}
