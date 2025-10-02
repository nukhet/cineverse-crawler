import { Worker } from 'bullmq';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { CineverseService } from '../cineverse/cineverse.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const cineverseService = app.get(CineverseService);

  const worker = new Worker(
    'crawl',
    async (job) => {
      if (job.name === 'scrapeSite') return cineverseService.scrapeSite();
      if (job.name === 'scrapeCinemas') return cineverseService.scrapeCinemas();
      if (job.name === 'scrapeMovies') {
        const { cinemaUrl, cinemaDate } = job.data;
        return cineverseService.scrapeMovies(cinemaUrl, cinemaDate);
      }
    },
    {
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
      },
    },
  );

  const shutdown = async () => {
    await worker.close();
    await app.close();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

bootstrap();