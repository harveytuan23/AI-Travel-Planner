// 1) 總是載入 server/.env（不分環境）
require('dotenv').config({ path: './.env' });

const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(express.json());

// 2) 基本設定
const NODE_ENV = process.env.NODE_ENV || 'production';
const groq_url_chat = 'https://api.groq.com/openai/v1/chat/completions';
const apiKey = process.env.GROQ_API_KEY;
const port = Number(process.env.SERVER_PORT || 3001);
const client_port = Number(process.env.CLIENT_PORT || 3000);

// 啟動前檢查金鑰（可選但很有用）
if (!apiKey) {
  console.warn('[WARN] GROQ_API_KEY not set. Requests to Groq will fail.');
}

// 3) CORS：允許本地、EC2、CloudFront（之後可改成你的自訂網域）
const corsOptions = {
  origin:
    NODE_ENV === 'production'
      ? [
          /^https?:\/\/.*\.cloudfront\.net$/,  // 你的 CloudFront
          /^https?:\/\/.*\.amazonaws\.com$/,   // 若你暫時用 EC2 Public DNS
          'http://localhost',                  // 可保留
          `http://localhost:${client_port}`
        ]
      : [`http://localhost:${client_port}`],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};
app.use(cors(corsOptions));

// 4) 健康檢查 & Root
app.get('/', (req, res) => res.send('Hello World!'));
app.get('/health', (req, res) => res.json({ ok: true }));

// 5) （若有 auth 路由，保留既有前綴）
const authRoute = require('./routes/auth');
app.use('/api/auth', authRoute);

// 6) 共同的 system prompt
const system_prompt =
  "You are a road travel planer. Users will prompt you with destination that they want to go to, you need to plan a route and provide sites worth going to. Please give your response in the following format: {Applebees@Corvallis,OR; Mo seafood@Newport,OR; Gold beach@Gold Beach,OR; etc..} Do not give any sentence response. If the prompt does not content one locations, give a 'no plan' response.";

// 7) 工具：把模型輸出的字串轉成 {origin, destination, waypoints[]}
function parseLocationString(locationString = '') {
  const cleanedString = locationString.replace(/[{}]/g, '').trim();
  const arr = cleanedString.split(';').map(s => s.trim()).filter(Boolean);
  if (arr.length === 0) return { origin: '', destination: '', waypoints: [] };
  const result = {
    origin: arr[0],
    destination: arr[arr.length - 1],
    waypoints: arr.slice(1, -1).map(loc => ({ location: loc, stopover: true }))
  };
  return result;
}

// 8) 範例：GET /api/generate-response（固定 prompt 測試用）
const prompt_content =
  "I am going back to San Jose,CA from Los Angeles,CA. And I would like to enjoy some ocean scenery.";

app.get('/api/generate-response', async (req, res) => {
  try {
    const requestBody = {
      model: 'llama-3.3-70b-versatile',   // 需要時再調整模型名
      messages: [
        { role: 'system', content: system_prompt },
        { role: 'user', content: prompt_content }
      ]
    };

    const r = await axios.post(groq_url_chat, requestBody, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    res.json(parseLocationString(r.data.choices[0].message.content));
  } catch (err) {
    console.error('Groq error /api/generate-response:', err?.response?.status, err?.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch data from the API', details: err?.response?.data || err.message });
  }
});

// 9) POST /api/chat：回傳模型的原始文字
app.post('/api/chat', async (req, res) => {
  try {
    const user_prompt = req.body?.prompt || '';
    const requestBody = {
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: system_prompt },
        { role: 'user', content: user_prompt }
      ]
    };

    const r = await axios.post(groq_url_chat, requestBody, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    res.json(r.data.choices[0].message.content);
  } catch (err) {
    console.error('Groq error /api/chat:', err?.response?.status, err?.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch data from the API', details: err?.response?.data || err.message });
  }
});

// 10) POST /api/locations：回傳結構化路線
app.post('/api/locations', async (req, res) => {
  try {
    const user_prompt = req.body?.prompt || '';
    const requestBody = {
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: system_prompt },
        { role: 'user', content: user_prompt }
      ]
    };

    const r = await axios.post(groq_url_chat, requestBody, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    res.json(parseLocationString(r.data.choices[0].message.content));
  } catch (err) {
    console.error('Groq error /api/locations:', err?.response?.status, err?.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch data from the API', details: err?.response?.data || err.message });
  }
});

// 11) 啟動（綁 0.0.0.0）
app.listen(port, '0.0.0.0', () => {
  console.log(`Example app listening on port ${port}`);
});
