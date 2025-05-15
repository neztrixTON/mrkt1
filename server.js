import express from 'express';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json());

app.post('/auth', async (req, res) => {
  const { initData } = req.body;

  if (!initData) {
    return res.status(400).json({ error: 'Отсутствует initData' });
  }

  const payload = {
    data: initData,
    photo: null,
    appId: null,
  };

  try {
    const response = await fetch('https://api.tgmrkt.io/api/v1/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': '*/*',
        'Origin': 'https://cdn.tgmrkt.io',
        'Referer': 'https://cdn.tgmrkt.io/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!data.token) {
      return res.status(502).json({ error: 'Невалидный ответ от API', raw: data });
    }

    res.json(data);
  } catch (err) {
    console.error('Ошибка запроса к tgmrkt.io:', err);
    res.status(500).json({ error: 'Ошибка при запросе', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на https://mrkt1-production.up.railway.app:${PORT}`);
});
