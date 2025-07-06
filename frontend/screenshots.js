import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure screenshots directory exists
const screenshotsDir = path.join(__dirname, 'public', 'screenshots');
if (!fs.existsSync(screenshotsDir)){
    fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function takeScreenshots() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    defaultViewport: null
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('Taking desktop screenshot...');
    await page.setViewport({
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
    });
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
    await delay(2000); // Wait for animations
    await page.screenshot({
      path: path.join(screenshotsDir, 'desktop.png'),
      fullPage: false
    });
    
    console.log('Taking mobile screenshot...');
    await page.setViewport({
      width: 750,
      height: 1334,
      deviceScaleFactor: 1,
      isMobile: true
    });
    await page.reload({ waitUntil: 'networkidle0' });
    await delay(2000); // Wait for animations
    await page.screenshot({
      path: path.join(screenshotsDir, 'mobile.png'),
      fullPage: false
    });

    console.log('Screenshots taken successfully!');
  } catch (error) {
    console.error('Error taking screenshots:', error);
  } finally {
    await browser.close();
  }
}

// Make sure your dev server is running on port 5173
console.log('Starting screenshot process...');
console.log('Make sure your dev server is running (npm run dev)');
takeScreenshots().catch(console.error);