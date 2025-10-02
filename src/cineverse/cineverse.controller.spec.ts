import { Test, TestingModule } from '@nestjs/testing';
import { CineverseController } from './cineverse.controller';
import { CineverseService } from './cineverse.service';

// Mock the crawl.queue module before importing the controller
jest.mock('../queues/crawl.queue', () => ({
  crawlQueue: {
    add: jest.fn().mockResolvedValue({ id: '123' }),
    close: jest.fn().mockResolvedValue(undefined),
  },
  crawlEvents: null,
}));

describe('CineverseController', () => {
  let controller: CineverseController;
  let service: CineverseService;
  let moduleRef: TestingModule;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      controllers: [CineverseController],
      providers: [CineverseService], 
    }).compile();

    controller = moduleRef.get<CineverseController>(CineverseController);
    service = moduleRef.get<CineverseService>(CineverseService);
  });

  afterEach(async () => {
    if (moduleRef) {
      await moduleRef.close();
    }
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('scrape() should call service.scrapeSite', async () => {
    const mockResult = { title: 'Mock Site' };
    jest.spyOn(service, 'scrapeSite').mockResolvedValue(mockResult);

    const result = await controller.scrape();
    expect(result).toEqual(mockResult);
    expect(service.scrapeSite).toHaveBeenCalled();
  });

  it('getCinemas() should call service.scrapeCinemas', async () => {
    const mockResult = [{ name: 'Mock Cinema', url: 'test', address: 'addr' }];
    jest.spyOn(service, 'scrapeCinemas').mockResolvedValue(mockResult);

    const result = await controller.getCinemas();
    expect(result).toEqual(mockResult);
    expect(service.scrapeCinemas).toHaveBeenCalled();
  });

  it('getMovies() should call service.scrapeMovies', async () => {
    const mockResult = [{ title: 'Mock Movie', options: [] }];
    jest.spyOn(service, 'scrapeMovies').mockResolvedValue(mockResult);

    const result = await controller.getMovies('url', '03-10-2025');
    expect(result).toEqual(mockResult);
    expect(service.scrapeMovies).toHaveBeenCalledWith('url', '03-10-2025');
  });
});