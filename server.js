import express from 'express';
import cors from 'cors';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';
import { fileURLToPath } from 'url';

const execPromise = util.promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==========================================
// 🔴 1. KONFIGURASI KUNCI MASTER (PASTE DI SINI)
// ==========================================
const YOUTUBE_COOKIE = "VISITOR_PRIVACY_METADATA=...; __Secure-3PSID=...; LOGIN_INFO=...; SID=...;"; 
const FB_COOKIE = "ps_l=1; datr=...; fr=...; i_user=61591264887251; xs=...; c_user=61589026658346;";

// Gunakan UA Poco M6 untuk sinkronisasi sesi mobile
const GHOST_USER_AGENT = 'Dalvik/2.1.0 (Linux; U; Android 14; POCO M6 Build/UKQ1.230804.001)';
const DESKTOP_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// ==========================================
// 🛠️ 2. FUNGSI TRANSCODING FFMPEG (9:16, <60s)
// ==========================================
async function formatVideoForShorts(inputPath, outputPath, sourceUsername) {
  console.log(`[🎬 FFMPEG] Transcoding video untuk @${sourceUsername}...`);
  // Paksa resolusi 1080x1920 (pad hitam jika landscape), potong 59 detik, pasang teks sumber
  const filter = `scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2,drawtext=text='Source\\: @${sourceUsername}':fontcolor=white:fontsize=48:box=1:boxcolor=black@0.6:boxborderw=10:x=(w-text_w)/2:y=(h-text_h)/2`;
  const cmd = `ffmpeg -y -i "${inputPath}" -t 59 -vf "${filter}" -c:v libx264 -preset veryfast -crf 23 -c:a aac -b:a 128k "${outputPath}"`;

  try {
    await execPromise(cmd);
    console.log(`[✅ FFMPEG] Render 9:16 selesai.`);
    return true;
  } catch (err) {
    console.error(`[❌ FFMPEG] Gagal render:`, err.message);
    return false;
  }
}

// ==========================================
// 🚀 3. GHOST UPLOAD YOUTUBE SHORTS
// ==========================================
async function executeYoutubeUpload(videoPath, title) {
  try {
    console.log("[👻 YT] Inisiasi upload ke server Scotty...");
    const initRes = await axios.post('https://upload.youtube.com/upload/studio', 
      { frontendUploadId: `innertube_studio_${Date.now()}` },
      { headers: {
          'Cookie': YOUTUBE_COOKIE,
          'User-Agent': DESKTOP_USER_AGENT,
          'x-goog-upload-command': 'start',
          'x-goog-upload-protocol': 'resumable'
      }}
    );

    const uploadUrl = initRes.headers['x-goog-upload-url'];
    const videoBuffer = fs.readFileSync(videoPath);
    
    console.log("[👻 YT] Mengirim payload MP4...");
    const uploadRes = await axios.post(uploadUrl, videoBuffer, {
      headers: {
        'Cookie': YOUTUBE_COOKIE,
        'User-Agent': DESKTOP_USER_AGENT,
        'x-goog-upload-command': 'upload, finalize',
        'x-goog-upload-offset': '0',
        'Content-Length': videoBuffer.length,
        'Content-Type': 'video/mp4'
      }
    });
    console.log(`[✅ YT] Upload sukses. ID Internal: ${uploadRes.data.scottyResourceId}`);
    // Eksekusi API Innertube untuk metadata bisa ditambahkan di sini.
  } catch (err) {
    console.error("[❌ YT] Gagal bypass YouTube:", err.message);
  }
}

// ==========================================
// 🚀 4. GHOST UPLOAD FACEBOOK REELS
// ==========================================
async function executeFacebookUpload(videoPath, title) {
  try {
    console.log("[👻 FB] Mengekstrak token dtsg...");
    const htmlRes = await axios.get('https://www.facebook.com/reels/create', {
      headers: { 'Cookie': FB_COOKIE, 'User-Agent': DESKTOP_USER_AGENT }
    });
    
    const dtsgMatch = htmlRes.data.match(/"DTSGInitialData",\[\],{"token":"([^"]+)"}/);
    if (!dtsgMatch) throw new Error("Token fb_dtsg tidak ditemukan.");
    const fb_dtsg = dtsgMatch[1];

    const videoBuffer = fs.readFileSync(videoPath);
    const videoId = `fb_vid_${Date.now()}`;
    
    console.log("[👻 FB] Mengirim payload ke RUpload...");
    await axios.post(`https://rupload.facebook.com/video-upload/v1.0/${videoId}`, videoBuffer, {
      headers: {
        'Cookie': FB_COOKIE,
        'User-Agent': DESKTOP_USER_AGENT,
        'Authorization': 'OAuth 438142079694454',
        'X-Entity-Length': videoBuffer.length.toString(),
        'X-Entity-Name': videoId,
        'X-Entity-Type': 'video/mp4',
        'Content-Type': 'application/octet-stream'
      }
    });

    console.log("[👻 FB] Menyematkan Metadata...");
    const publishPayload = new URLSearchParams({
      'fb_dtsg': fb_dtsg,
      'video_id': videoId,
      'title': title,
      'composer_entry_picker': 'reels_composer',
      'c_user': '61589026658346'
    });

    await axios.post('https://www.facebook.com/api/graphql/', publishPayload, {
      headers: {
        'Cookie': FB_COOKIE,
        'User-Agent': DESKTOP_USER_AGENT,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    console.log("[✅ FB] Reels berhasil di-publish!");
  } catch (err) {
    console.error("[❌ FB] Gagal bypass Facebook:", err.message);
  }
}

// ==========================================
// ⚙️ 5. MASTER PIPELINE DISTRIBUSI
// ==========================================
const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/force-publish', async (req, res) => {
  const { rawVideoUrl, sourceUsername, title } = req.body;
  res.json({ status: 'Processing Pipeline Initiated' });

  const tempInput = path.join('/tmp', `raw_${Date.now()}.mp4`);
  const tempOutput = path.join('/tmp', `ready_${Date.now()}.mp4`);

  try {
    console.log(`\n=== MEMULAI SIKLUS: @${sourceUsername} ===`);
    
    // 1. Download Stream Video Mentah
    const writer = fs.createWriteStream(tempInput);
    const response = await axios({ url: rawVideoUrl, method: 'GET', responseType: 'stream' });
    response.data.pipe(writer);
    
    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    // 2. Format FFmpeg
    const isReady = await formatVideoForShorts(tempInput, tempOutput, sourceUsername);

    if (isReady) {
      // 3. Distribusi Paralel via HTTP
      await Promise.all([
        executeYoutubeUpload(tempOutput, `${title} #shorts`),
        executeFacebookUpload(tempOutput, `${title} #reels`)
      ]);
    }
  } catch (error) {
    console.error(`[❌ PIPELINE] Gagal total:`, error.message);
  } finally {
    // 4. Bersihkan sampah
    if (fs.existsSync(tempInput)) fs.unlinkSync(tempInput);
    if (fs.existsSync(tempOutput)) fs.unlinkSync(tempOutput);
    console.log(`=== SIKLUS SELESAI ===\n`);
  }
});

app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 GHOST ENGINE API AKTIF di port ${PORT}`));
