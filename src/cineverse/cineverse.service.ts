import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import * as puppeteer from 'puppeteer';

@Injectable()
export class CineverseService {
  async scrapeSite() {
    const url = 'https://www.paribucineverse.com/';
    const { data: html } = await axios.get(url);
    const $ = cheerio.load(html);

    const title = $('title').text().trim();
    const metaDescription = $('meta[name="description"]').attr('content') || '';
    const favicon = $('link[rel="icon"]').attr('href') || '';

    const scripts: string[] = [];
    $('script[src]').each((_, el) => {
      const src = $(el).attr('src');
      if (src) scripts.push(src);
    });

    const stylesheets: string[] = [];
    $('link[rel="stylesheet"]').each((_, el) => {
      const href = $(el).attr('href');
      if (href) stylesheets.push(href);
    });

    const images: string[] = [];
    $('img[src]').each((_, el) => {
      const src = $(el).attr('src');
      if (src) images.push(src);
    });

    return { title, metaDescription, favicon, scripts, stylesheets, images };
  }

  async scrapeCinemas() {
    const url = 'https://www.paribucineverse.com/sinemalar';
    const { data: html } = await axios.get(url);
    const $ = cheerio.load(html);
  
    const cinemas: {
      name: string;
      url: string;
      address: string;
      mapUrl?: string;
    }[] = [];
  
    $('.card').each((_, el) => {
      const name = $(el).find('.text-area h2').text().trim();
      const relativeUrl = $(el).find('.text-area a').attr('href') || '';
      const fullUrl = relativeUrl
        ? new URL(relativeUrl, 'https://www.paribucineverse.com').href
        : '';
  
      const address = $(el).find('.text-area p').text().trim();
      const mapUrl = $(el).find('.icon-area .icon-item').eq(1).find('a[target="_blank"]').attr('href') || '';

      cinemas.push({
        name,
        url: fullUrl,
        address,
        mapUrl,
      });
    });
  
    return cinemas;
  }

  async scrapeMovies(cinemaUrl: string, cinemaDate: string) {
    const url = `${cinemaUrl}?tarih=${cinemaDate}`;
    const { data: html } = await axios.get(url);
    const $ = cheerio.load(html);
    
    const movies: {
      title: string;
      originalTitle: string;
      duration: string;
      genre: string;
      options: {
        format: string;
        icon?: string;
        sessions: { time: string; url: string }[];
      }[];
    }[] = [];
  
    $('#movieRow').each((_, el) => {
      const title = $(el).find('h3.movieName').first().text().trim();
      const originalTitle = $(el).find('p#movieDescription').first().text().trim();
      const duration = $(el).find('#movieRuntime').first().text().trim();
      const genre = $(el).find('#movieGenre').first().text().trim();
  
      const options: {
        format: string;
        icon?: string;
        sessions: { time: string; url: string }[];
      }[] = [];
  
      $(el).find('.row.time-row-list').each((_, optEl) => {
        const format = $(optEl).find('.cinema-detail-tech-text').text().trim();
        const iconSrc = $(optEl).find('.logo-box-area img').attr('src') || '';
        const icon = iconSrc ? new URL(iconSrc, 'https://www.paribucineverse.com').href : '';

        const sessions: { time: string; url: string }[] = [];
        $(optEl).find('a.cinema-list-item').each((_, se) => {
          const time = $(se).text().trim();
          const link = $(se).attr('data-url') || '';
          const fullLink = link ? new URL(link, 'https://www.paribucineverse.com').href : '';
          sessions.push({ time, url: fullLink });
        });
  
        if (format || sessions.length > 0) {
          options.push({ format, icon, sessions });
        }
      });
  
      if (title) {
        movies.push({ title, originalTitle, duration, genre, options });
      }
    });
  
    return movies;
  }

  async scrapeSiteWithBrowser() {
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Safari/605.1.15',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
    ];
    const randomUA = userAgents[Math.floor(Math.random() * userAgents.length)];
  
    const proxyServer = process.env.PROXY_SERVER || '';
    const headless = process.env.HEADLESS !== 'false';
  
    const browser = await puppeteer.launch({
      headless,
      args: proxyServer ? [`--proxy-server=${proxyServer}`] : [],
    });
  
    const page = await browser.newPage();
    await page.setUserAgent(randomUA);
  
    const targetUrl = 'https://www.paribucineverse.com/';
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
  
    const title = await page.title();
    const metaDescription = await page
      .$eval('meta[name="description"]', el => el.getAttribute('content'))
      .catch(() => '');
    const favicon = await page
      .$eval('link[rel="icon"]', el => el.getAttribute('href'))
      .catch(() => '');
  
    const scripts = await page.$$eval('script[src]', els =>
      els.map(e => e.getAttribute('src')).filter(Boolean),
    );
    const stylesheets = await page.$$eval('link[rel="stylesheet"]', els =>
      els.map(e => e.getAttribute('href')).filter(Boolean),
    );
    const images = await page.$$eval('img[src]', els =>
      els.map(e => e.getAttribute('src')).filter(Boolean),
    );
  
    await browser.close();
  
    return { title, metaDescription, favicon, scripts, stylesheets, images };
  }


}
