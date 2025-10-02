import { Controller, Get, Query, Post, Body } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags, ApiBody, ApiResponse } from '@nestjs/swagger';
import { CineverseService } from './cineverse.service';
import { crawlQueue } from '../queues/crawl.queue';

@Controller('cineverse')
export class CineverseController {
  constructor(private readonly cineverseService: CineverseService) {}

  @Get('scrape')
  @ApiOperation({ summary: 'Scrape homepage metadata', description: 'Fetches metadata (title, description, favicon, scripts, stylesheets, images) from Paribu Cineverse homepage.' })
  @ApiResponse({
    status: 200,
    description: 'OK',
    schema: {
      example: {
        title: 'Konforlu ve Kaliteli Sinema Deneyimi',
        metaDescription:
          'Paribu Cineverse kalitesiyle standartların ötesinde bir sinema deneyimi yaşayın! Vizyondaki sinema filmleri ve seanslar hakkında bilgi almak için hemen tıklayın!',
        favicon: '/Assets/Cgv/assets/images/icons/paribu-favicon.png',
        scripts: [
          '//googleads.github.io/videojs-ima/node_modules/video.js/dist/video.min.js',
          '//imasdk.googleapis.com/js/sdkloader/ima3.js',
          '//googleads.github.io/videojs-ima/node_modules/videojs-contrib-ads/dist/videojs.ads.min.js',
          '//googleads.github.io/videojs-ima/dist/videojs.ima.js',
          'https://execution-ci360.paribucineverse.com/js/ot2.min.js'
        ],
        stylesheets: [
          '//googleads.github.io/videojs-ima/node_modules/video.js/dist/video-js.min.css',
          '//googleads.github.io/videojs-ima/node_modules/videojs-contrib-ads/dist/videojs.ads.css',
          '//googleads.github.io/videojs-ima/dist/videojs.ima.css',
          '/assets/libs/swiper/css/swiper-bundle.min.css?v=150820250207'
        ],
        images: [
          '/assets/img/logo/logo.svg?v=240820231250',
          '/Assets/img/header/banner-baloon-l.png',
          '/Assets/img/header/banner-baloon-r.png',
          'https://www.paribucineverse.com/Files/776519010-halk-gunu-841x414.jpg'
        ],
      },
    },
  })
  async scrape() {
    return this.cineverseService.scrapeSite();
  }

  @Get('cinemas')
  @ApiOperation({
    summary: 'Scrape cinema list',
    description: 'Fetches all cinema halls, including their names, URLs, addresses, and map links.',
  })
  @ApiResponse({
    status: 200,
    description: 'OK',
    schema: {
      example: [
        {
          name: "Paribu Cineverse 14 Bolu Burda",
          url: "https://www.paribucineverse.com/sinemalar/14-burda",
          address: "14 BURDA, Paşaköy Mah. D-100 Karayolu Cad. No: 8-16, 14100, Bolu",
          mapUrl: "http://maps.google.com/maps?q=40.7321,31.563"
        },
        {
          name: "Paribu Cineverse 17 Çanakkale Burda",
          url: "https://www.paribucineverse.com/sinemalar/17-burda",
          address: "Barbaros Mah. Atatürk Cad. No: 207 \\ Çanakkale",
          mapUrl: "http://maps.google.com/maps?q=40.1237,26.4105"
        },
        {
          name: "Paribu Cineverse 41 Izmit Burda",
          url: "https://www.paribucineverse.com/sinemalar/41-burda",
          address: "41 Burda, Sanayi Mah. Ömer Türkçakal Bulvarı No: 7, 41040 İzmit, Kocaeli",
          mapUrl: "http://maps.google.com/maps?q=40.7564,29.9432"
        }
      ],
    },
  })
  async getCinemas() {
    return this.cineverseService.scrapeCinemas();
  }

  @Get('movies')
  @ApiOperation({ summary: 'Scrape movies for a cinema and date', description: 'Scrapes movies, formats, and showtimes for a given cinema URL and date.' })
  @ApiQuery({ name: 'cinemaUrl', required: true, description: 'The URL of the cinema page (e.g., https://www.paribucineverse.com/sinemalar/istinyepark)' })
  @ApiQuery({ name: 'cinemaDate', required: true, description: 'The date in format DD-MM-YYYY (e.g., 02-10-2025)' })
  @ApiResponse({
	  status: 200,
	  description: 'List of movies with formats and showtimes',
	  schema: {
	    example: [
	      {
	        title: 'Hobbit: Smaug\'un Çorak Toprakları',
	        originalTitle: 'The Hobbit: The Desolation of Smaug',
	        duration: '2 sa 41 dk',
	        genre: 'Macera',
	        options: [
	          {
	            format: 'IMAX 3D - ALTYAZILI',
	            icon: 'https://www.paribucineverse.com/assets/img/icons/cinema_types/imax.svg',
	            sessions: [
	              { time: '18:20', url: '/biletleme/~step~ticket~code~0000000037~session~208744' },
	              { time: '21:00', url: '/biletleme/~step~ticket~code~0000000037~session~208804' }
	            ]
	          }
	        ]
	      }
	    ],
	  },
  })
  async getMovies(
    @Query('cinemaUrl') cinemaUrl: string,
    @Query('cinemaDate') cinemaDate: string,
  ) {
    return this.cineverseService.scrapeMovies(cinemaUrl, cinemaDate);
  }


  @Post('crawl')
  @ApiOperation({
    summary: 'Add a crawl job',
    description: 'Enqueue a scraping job (scrapeSite, scrapeCinemas, scrapeMovies) to be processed by BullMQ worker.',
  })
  @ApiBody({
    description: 'Job type and data payload',
    examples: {
        scrapeSite: {
          summary: 'Scrape homepage metadata',
          value: {
            type: 'scrapeSite',
            data: {},
          },
        },
        scrapeCinemas: {
          summary: 'Scrape all cinemas',
          value: {
            type: 'scrapeCinemas',
            data: {},
          },
        },
        scrapeMovies: {
          summary: 'Scrape movies for a cinema/date',
          value: {
            type: 'scrapeMovies',
            data: {
              cinemaUrl: 'https://www.paribucineverse.com/sinemalar/istinyepark',
              cinemaDate: '02-10-2025',
            },
          },
        },
      },
  })

  @ApiResponse({
    status: 200,
    description: 'Job successfully queued',
    schema: {
      example: {
        jobId: '123',
      },
    },
  })
  async addJob(@Body() body: any) {
    const { type, data } = body;
    const job = await crawlQueue.add(type, data);
    return { jobId: job.id };
  }
}
