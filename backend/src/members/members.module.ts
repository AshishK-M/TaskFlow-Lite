import { Module } from '@nestjs/common';
import { BoardsModule } from '../boards/boards.module';
import { MembersController } from './members.controller';
import { MembersService } from './members.service';

@Module({
  imports: [BoardsModule],
  controllers: [MembersController],
  providers: [MembersService],
})
export class MembersModule {}
