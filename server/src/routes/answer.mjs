import express from 'express';
import axios from 'axios';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ 
        error: "Message cannot be empty",
        processingTime: 0
      });
    }

    const startTime = Date.now();
    
    // Отправляем запрос в Colab-сервер
    const colabResponse = await axios.post(
      'https://copy-exploring-ware-canal.trycloudflare.com/api/colab',
      { message },
      { timeout: 15000 }
    );

    const processingTime = Date.now() - startTime;

    // Форматируем ответ согласно ожиданиям фронтенда
    res.status(200).json({
      answer: colabResponse.data.response || colabResponse.data, // Учитываем разные форматы ответа
      processingTime
    });

  } catch (error) {
    const processingTime = error.response?.data?.processingTime || 0;
    res.status(500).json({ 
      error: error.message,
      processingTime
    });
  }
});

export default router;