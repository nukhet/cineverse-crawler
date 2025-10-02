import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CineverseModule } from './cineverse/cineverse.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // tüm projede env değişkenleri kullanılabilir
    }),
    CineverseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
