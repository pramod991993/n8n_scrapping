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
  console.log('✅ Received POST /scrape', req.body);
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
      ],
    });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    const content = await page.evaluate(() =>
      Array.from(document.querySelectorAll('p'))
        .map(p => p.innerText)
        .join('\n\n')
    );
    await browser.close();
    return res.json({ content });
  } catch (err) {
    console.error('🛑 Puppeteer error:', err);
    if (browser) await browser.close();
    return res.status(500).json({ error: 'Scraping failed', details: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Puppeteer API listening on port ${PORT}`));
