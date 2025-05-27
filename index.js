const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
app.use(express.json());

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
        // these can help in some CI/container environments:
        '--disable-dev-shm-usage',
        '--single-process',
      ],
    });
    const page = await browser.newPage();

    // Optional: if you need to pass cookies, uncomment and fill:
    // await page.setCookie({ name: 'sessionid', value: 'YOUR_COOKIE_HERE', domain: '.indianexpress.com' });

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    const content = await page.evaluate(() =>
      Array.from(document.querySelectorAll('p')).map(p => p.innerText).join('\n\n')
    );

    await browser.close();
    return res.json({ content });
  } catch (err) {
    console.error('🛑 Puppeteer error:', err);
    if (browser) await browser.close();
    return res.status(500).json({ error: 'Scraping failed', details: err.message });
  }
});

// Health check endpoint
app.get('/', (_req, res) => res.send({ status: 'ok' }));

app.listen(3000, () => console.log('🚀 Puppeteer API listening on port 3000'));
