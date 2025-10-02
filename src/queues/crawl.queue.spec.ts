import { Queue, QueueEvents } from 'bullmq';

jest.mock('bullmq', () => {
  return {
    Queue: jest.fn().mockImplementation((name, options) => {
      return {
        name,
        options,
        add: jest.fn(),
        close: jest.fn().mockResolvedValue(undefined),
      };
    }),
    QueueEvents: jest.fn().mockImplementation(() => {
      return {
        on: jest.fn(),
        close: jest.fn().mockResolvedValue(undefined),
      };
    }),
  };
});

import { crawlQueue, crawlEvents } from './crawl.queue';

describe('crawlQueue', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  afterAll(async () => {
    // Close the queue
    if (crawlQueue && typeof crawlQueue.close === 'function') {
      await crawlQueue.close();
    }
    // Close the events
    if (crawlEvents && typeof crawlEvents.close === 'function') {
      await crawlEvents.close();
    }
  });

  it('should be created with correct name', () => {
    expect(crawlQueue.name).toBe('crawl');
  });

  it('should use Redis host and port from env or defaults', () => {
    const host = process.env.REDIS_HOST || 'localhost';
    const port = parseInt(process.env.REDIS_PORT || '6379', 10);

    expect(crawlQueue.options.connection.host).toBe(host);
    expect(crawlQueue.options.connection.port).toBe(port);
  });

  it('should use rate limiting values from env or defaults', () => {
    const max = parseInt(process.env.RATE_LIMIT_MAX || '5', 10);
    const duration = parseInt(process.env.RATE_LIMIT_DURATION || '1000', 10);

    expect(crawlQueue.options.limiter).toEqual({ max, duration });
  });
});