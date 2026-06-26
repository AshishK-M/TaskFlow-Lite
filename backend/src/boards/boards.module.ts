import { Module } from '@nestjs/common';
import { BoardsController } from './boards.controller';
import { BoardsService } from './boards.service';
import { MembershipService } from './membership.service';

@Module({
  controllers: [BoardsController],
  providers: [BoardsService, MembershipService],
  exports: [MembershipService],
})
export class BoardsModule {}
