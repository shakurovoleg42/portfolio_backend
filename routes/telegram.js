const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config();
const express = require("express");
const rateLimit = require("express-rate-limit");

const router = express.Router();

// Получаем токен и chat_id из переменных окружения
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

if (!TELEGRAM_TOKEN || !CHAT_ID) {
  console.error("Ошибка: TELEGRAM_TOKEN или CHAT_ID не определены в .env");
  process.exit(1);
}

const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: false });

const formLimiter = rateLimit({
  windowMs: 30 * 1000,
  max: 2,
  message: {
    success: false,
    message: "Слишком много запросов. Подождите 30 секунд.",
  },
});

const isSpam = (text) => {
  const spamWords = ["http", "https", "spam", "casino", "free money"]; // Запрещенные слова
  if (text.length < 5) return true; // Слишком короткие сообщения
  return spamWords.some((word) => text.toLowerCase().includes(word));
};

router.get("/telegram-form", formLimiter, async (req, res) => {
  try {
    const { name, email, message } = req.query;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Ошибка: все поля (name, email, message) обязательны",
      });
    }

    if (isSpam(message)) {
      return res.status(400).json({
        success: false,
        message: "Ваше сообщение похоже на спам. Проверьте его содержание.",
      });
    }

    const text = `📩 *Новая заявка:*
👤 *Имя:* ${name}
📧 *Email:* ${email}
📝 *Сообщение:* ${message}`;

    await bot.sendMessage(CHAT_ID, text, { parse_mode: "Markdown" });

    res.status(200).json({
      success: true,
      message: "Заявка успешно отправлена в Telegram!",
    });
  } catch (err) {
    console.error("Ошибка отправки в Telegram:", err);
    res.status(500).json({ success: false, message: "Ошибка сервера" });
  }
});

module.exports = router;
