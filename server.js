import express from 'express';
import cors from 'cors';
import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// 1. ENDPOINT PEKERJA HANTU
app.post('/api/force-publish', async (req, res) => {
  const { id, url = "https://example.com/video", sourceUsername = "viral_indo" } = req.body;
  console.log(`\n[⚡ ENGINE] Memulai hijack untuk ID: ${id}`);
  res.json({ status: 'Processing' });

  try {
    const browser = await chromium.launch({
      headless: true,
      proxy: {
        server: 'http://193.5.64.122:50100',
        username: 'BIxLZc1d',
        password: '3NI6OSzFAJ'
      }
    });

    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto('about:blank');
    await page.setContent(`
      <div style="display: flex; justify-content: center; align-items: center; height: 100vh; background: #111;">
        <div style="position: relative; width: 350px; height: 600px; background: #000; border-radius: 12px; overflow: hidden;">
          <iframe src="${url}" width="100%" height="100%" style="border:none;"></iframe>
          <div style="position: absolute; bottom: 40px; left: 50%; transform: translateX(-50%); background: rgba(0, 0, 0, 0.8); color: white; padding: 8px 16px; border-radius: 20px; font-family: monospace; font-size: 12px; z-index: 999; border: 1px solid rgba(255,255,255,0.2);">
            Source: @${sourceUsername}
          </div>
        </div>
      </div>
    `);

    await page.waitForTimeout(3000);
    console.log(`[🤖 WORKER] Injeksi selesai. Mematikan peramban.`);
    await browser.close();
  } catch (error) {
    console.error(`[❌ ENGINE] Gagal:`, error);
  }
});

// 2. MELAYANI UI DASBOR
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 UNIFIED ENGINE STANDBY di port ${PORT}`);
});
    
