import { Queue, QueueEvents } from 'bullmq';

export const crawlQueue = new Queue('crawl', {
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },
  limiter: {
    max: parseInt(process.env.RATE_LIMIT_MAX || '5', 10),
    duration: parseInt(process.env.RATE_LIMIT_DURATION || '1000', 10),
  },
});

export let crawlEvents: QueueEvents | null = null;

if (process.env.NODE_ENV !== 'test') {
  crawlEvents = new QueueEvents('crawl', {
    connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    },
  });

  crawlEvents.on('completed', ({ jobId, returnvalue }) => {
    console.log(`Job ${jobId} completed with`, returnvalue);
  });

  crawlEvents.on('failed', ({ jobId, failedReason }) => {
    console.error(`Job ${jobId} failed: ${failedReason}`);
  });
}
