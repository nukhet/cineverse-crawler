# Cineverse Crawler

A Nest.js based crawler for Paribu Cineverse, implemented as part of the job test task.  

The crawler supports both lightweight scraping with axios/cheerio and browser-based crawling with Puppeteer, along with BullMQ queue integration, Swagger documentation, proxy/VPN support, and unit tests.

## 🚀 Setup
### Requirements

 - Node.js >= 18
 - npm
 - Redis (running locally on localhost:6379)
 - (Optional) Proxy/VPN endpoint  

### Installation
 - git clone https://github.com/nukhet/cineverse-crawler
 - cd cineverse-crawler
 - npm install

## Environment Variables
Create a `.env` file in the project root:
```bash
# Redis connection
REDIS_HOST=localhost
REDIS_PORT=6379

# Proxy server (optional)
PROXY_SERVER=http://user:password@proxyhost:port

# Puppeteer settings
# True for headless mode, false to see the browser
HEADLESS=true

# BullMQ rate limiting (jobs per interval)
RATE_LIMIT_MAX=5
RATE_LIMIT_DURATION=1000
```

## ▶️ Running the Application
Start the Nest.js server:
```bash
% npm run start:dev
```
Swagger UI is available at:
👉 http://localhost:3000/api

## 🗂 Endpoints
**Scrape homepage metadata**
> GET /cineverse/scrape

Returns title, meta description, favicon, scripts, stylesheets, and images.

**Scrape all cinemas**
> GET /cineverse/cinemas

Returns a list of all cinemas with name, URL, address, and map link.

**Scrape movies for a cinema & date**
> GET /cineverse/movies?cinemaUrl=`<url>`&tarih=`<date>`

 - Example:
http://localhost:3000/cineverse/movies?cinemaUrl=https://www.paribucineverse.com/sinemalar/14-burda&tarih=02-10-2025

**Enqueue a crawl job**
> POST /cineverse/crawl
 - Example body:
```json
{
  "type": "scrapeMovies",
  "data": {
    "cinemaUrl": "https://www.paribucineverse.com/sinemalar/14-burda",
    "cinemaDate": "02-10-2025"
  }
}
```
## 🔄 Worker
Start the BullMQ worker separately:
```bash
% npx ts-node src/workers/crawl.worker.ts
```
Jobs will be processed and logs will be shown in the worker terminal.

## 🌐 Browser Crawling
The crawler includes a Puppeteer-based method for cases requiring 

 - JavaScript rendering.
 - Random User-Agent rotation on each run.
 - Proxy/VPN support via `PROXY_SERVER` in `.env`.
 - Rate limiting with BullMQ to prevent blocking.

## ✅ Testing
Run unit tests:
```bash
# unit tests
$ npm run test
```
Tests cover:

 - `scrapeSite()` metadata parsing
 - `scrapeCinemas()` cinema list parsing
 - `scrapeMovies()` movies, formats, and sessions
 - Puppeteer-based crawling
 
## 📌 Notes
 - Axios + Cheerio for lightweight scraping.
 - Puppeteer for advanced crawling with proxy/VPN.
 - Redis required for job queue processing.
 - Configure  `.env`  before running if using proxies.
