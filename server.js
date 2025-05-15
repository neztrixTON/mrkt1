import express from 'express';
import { validate, parse } from '@telegram-apps/init-data-node';
import fetch from 'node-fetch';

const app = express();
const PORT = 3000;
const TELEGRAM_BOT_SECRET = 'e7bf03a2fa4602af4580703d88dda5bb59f32ed8b02a56c187fe7d34caed242d ';

app.use(express.static('public'));
app.use(express.json());

app.post('/auth', async (req, res) => {
  const initDataRaw = req.headers['authorization']?.split(' ')[1];
  if (!initDataRaw) {
    return res.status(400).json({ error: 'Missing initData' });
  }

  try {
    const { initData, user } = parse(initDataRaw);
    const isValid = validate(initDataRaw, TELEGRAM_BOT_SECRET);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid initData signature' });
    }

    const payload = {
      data: `query_id=...&user=${encodeURIComponent(JSON.stringify(user))}&auth_date=${initData.auth_date}&signature=...&hash=...`,
      photo: user.photo_url,
      appId: null,
    };

    const response = await fetch('https://api.tgmrkt.io/api/v1/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': '*/*',
        'Origin': 'https://cdn.tgmrkt.io',
        'Referer': 'https://cdn.tgmrkt.io',
      },
      body: JSON.stringify(payload),
    });

    const json = await response.json();
    if (json.token) {
      res.json(json);
    } else {
      res.status(500).json({ error: 'Invalid response from API', raw: JSON.stringify(json) });
    }
  } catch (err) {
    res.status(500).json({ error: 'Error during auth request', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://mrkt1-production-076a.up.railway.app:${PORT}`);
});
