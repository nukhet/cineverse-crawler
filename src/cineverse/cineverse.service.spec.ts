import { Test, TestingModule } from '@nestjs/testing';
import { CineverseService } from './cineverse.service';
import * as puppeteer from 'puppeteer';

jest.mock('puppeteer');

describe('CineverseService', () => {
  let service: CineverseService;
  let moduleRef: TestingModule;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      providers: [CineverseService],
    }).compile();

    service = moduleRef.get<CineverseService>(CineverseService);
  });

  afterEach(async () => {
    if (moduleRef) {
      await moduleRef.close();
    }
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('scrapeSite should return metadata with title', async () => {
    const result = await service.scrapeSite();
    expect(result).toHaveProperty('title');
    expect(typeof result.title).toBe('string');
  });

  it('scrapeCinemas should return an array of cinemas', async () => {
    const result = await service.scrapeCinemas();
    expect(Array.isArray(result)).toBe(true);
    if (result.length > 0) {
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('url');
      expect(result[0]).toHaveProperty('address');
    }
  });

  it('scrapeMovies should return an array of movies', async () => {
    const cinemaUrl = 'https://www.paribucineverse.com/sinemalar/14-burda';
    const cinemaDate = '02-10-2025';
    const result = await service.scrapeMovies(cinemaUrl, cinemaDate);
    expect(Array.isArray(result)).toBe(true);
    if (result.length > 0) {
      expect(result[0]).toHaveProperty('title');
      expect(result[0]).toHaveProperty('options');
    }
  });

  it('should return metadata from scrapeSiteWithBrowser', async () => {
    const mockGoto = jest.fn();
    const mockTitle = jest.fn().mockResolvedValue('Mock Title');
    const mockEval = jest.fn().mockResolvedValue('Mock Value');
    const mockEvalEmpty = jest.fn().mockRejectedValue(new Error('not found'));
    const mockClose = jest.fn();

    const mockPage: any = {
      goto: mockGoto,
      title: mockTitle,
      $eval: jest.fn((selector: string) => {
        if (selector === 'meta[name="description"]') return mockEval();
        if (selector === 'link[rel="icon"]') return mockEval();
        return mockEvalEmpty();
      }),
      $$eval: jest.fn().mockResolvedValue(['mock.js', 'mock.css', 'mock.png']),
      setUserAgent: jest.fn(),
    };

    const mockBrowser: any = {
      newPage: jest.fn().mockResolvedValue(mockPage),
      close: mockClose,
    };

    (puppeteer.launch as jest.Mock).mockResolvedValue(mockBrowser);

    const result = await service.scrapeSiteWithBrowser();

    expect(result).toHaveProperty('title');
    expect(result).toHaveProperty('metaDescription');
    expect(result).toHaveProperty('favicon');
    expect(Array.isArray(result.scripts)).toBe(true);
    expect(Array.isArray(result.stylesheets)).toBe(true);
    expect(Array.isArray(result.images)).toBe(true);
    expect(mockGoto).toHaveBeenCalledWith(
      'https://www.paribucineverse.com/',
      expect.objectContaining({ waitUntil: 'domcontentloaded' })
    );
    expect(mockClose).toHaveBeenCalled();
  });
});