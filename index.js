const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
app.use(express.json());

// Health-check endpoint
app.get('/', (req, res) => {
  console.log('✅ Received GET /');
  return res.json({ status: 'ok' });
});

app.post('/scrape', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL required' });

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--single-process',
      ]
    });
    const page = await browser.newPage();

    // Navigate, but only wait for DOMContentLoaded
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Now wait for at least one <p> to appear
    await page.waitForSelector('p', { timeout: 10000 });

    // Extract all <p> text
    const content = await page.$$eval('p', ps =>
      ps.map(p => p.innerText).join('\n\n')
    );

    await browser.close();
    return res.json({ content });
  } catch (err) {
    console.error('🛑 Puppeteer error:', err);
    if (browser) await browser.close();
    return res.status(500).json({
      error: 'Scraping failed',
      details: err.message.includes('frame') 
        ? 'Frame detached — page may have redirected or refreshed too quickly. Retrying with DOMContentLoaded strategy.'
        : err.message
    });
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Puppeteer API listening on port ${PORT}`));
