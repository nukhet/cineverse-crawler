import { Module } from '@nestjs/common';
import { CineverseService } from './cineverse.service';
import { CineverseController } from './cineverse.controller';

@Module({
  providers: [CineverseService],
  controllers: [CineverseController]
})
export class CineverseModule {}
