import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.static('public'));
app.use(express.json());

app.post('/auth', async (req, res) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('tma ')) {
    return res.status(400).json({ error: 'Отсутствует или неверный заголовок Authorization' });
  }

  const initData = authHeader.slice(4); // Удаляем 'tma ' из начала строки

  const payload = {
    data: initData,
    photo: null,
    appId: null
  };

  try {
    const response = await fetch('https://api.tgmrkt.io/api/v1/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': '*/*',
        'Origin': 'https://cdn.tgmrkt.io',
        'Referer': 'https://cdn.tgmrkt.io/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 YaBrowser/25.4.0.0 Safari/537.36'
      },
      body: JSON.stringify(payload)
    });

    const text = await response.text();
    try {
      const json = JSON.parse(text);
      res.json(json);
    } catch (parseError) {
      res.status(502).json({ error: 'Невалидный ответ от API', raw: text });
    }
  } catch (err) {
    console.error('Ошибка запроса к tgmrkt.io:', err);
    res.status(500).json({ error: 'Ошибка при запросе', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
