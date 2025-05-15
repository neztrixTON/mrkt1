import express from 'express';
import fetch from 'node-fetch';
import bodyParser from 'body-parser';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware для парсинга JSON
app.use(bodyParser.json());

// Обработка POST-запроса на /auth
app.post('/auth', async (req, res) => {
  try {
    const requestData = req.body;

    // Отправка запроса к внешнему API
    const response = await fetch('https://api.tgmrkt.io/api/v1/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': '*/*',
        // Добавьте другие необходимые заголовки здесь
      },
      body: JSON.stringify(requestData),
    });

    // Проверка статуса ответа
    if (!response.ok) {
      console.error(`Ошибка: ${response.status} ${response.statusText}`);
      return res.status(response.status).json({ error: 'Ошибка при обращении к внешнему API' });
    }

    // Получение текста ответа
    const text = await response.text();

    // Проверка на пустой ответ
    if (!text) {
      console.error('Пустой ответ от внешнего API');
      return res.status(502).json({ error: 'Пустой ответ от внешнего API' });
    }

    // Попытка разбора ответа как JSON
    let json;
    try {
      json = JSON.parse(text);
    } catch (parseError) {
      console.error('Ошибка при разборе JSON:', parseError);
      return res.status(500).json({ error: 'Некорректный JSON в ответе от внешнего API' });
    }

    // Отправка успешного ответа клиенту
    res.json(json);
  } catch (error) {
    console.error('Ошибка при обработке запроса:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
