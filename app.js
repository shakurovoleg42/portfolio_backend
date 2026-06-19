const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3001;

// CORS configuration (supports development environments and production)
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:8080",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
];

if (process.env.CORS_ORIGIN) {
  process.env.CORS_ORIGIN.split(",").forEach((origin) => {
    const trimmed = origin.trim();
    if (trimmed && !allowedOrigins.includes(trimmed)) {
      allowedOrigins.push(trimmed);
    }
  });
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.indexOf(origin) !== -1 ||
        allowedOrigins.includes("*")
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Telegram Bot
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

if (!TELEGRAM_TOKEN || !CHAT_ID) {
  console.error("❌ Error: TELEGRAM_TOKEN or CHAT_ID is not defined in .env");
  process.exit(1);
}

const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: false });

// Rate Limiting (max 3 requests per minute per IP to avoid spam)
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  message: {
    success: false,
    message: "Слишком много запросов. Пожалуйста, подождите минуту.",
  },
});

// Simple spam detection
const isSpam = (text) => {
  const spamWords = ["vulgar"];
  if (text.length < 3) return true;
  return spamWords.some((word) => text.toLowerCase().includes(word));
};

// API Endpoint to send message
app.post("/api/telegram", apiLimiter, async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !message) {
      return res.status(400).json({
        success: false,
        message: "Имя и сообщение обязательны для заполнения.",
      });
    }

    if (isSpam(message)) {
      return res.status(400).json({
        success: false,
        message: "Ваше сообщение не прошло проверку на спам.",
      });
    }

    // Format message
    const formattedEmail = email && email.trim() ? email.trim() : "Не указан";
    const formattedText = `📩 *Новая заявка с сайта:*
👤 *Имя:* ${name.trim()}
📧 *Email:* ${formattedEmail}
📝 *Сообщение:*
${message.trim()}`;

    // Send to Telegram
    await bot.sendMessage(CHAT_ID, formattedText, { parse_mode: "Markdown" });

    console.log(`✅ Message from ${name} sent to Telegram.`);

    return res.status(200).json({
      success: true,
      message: "Сообщение успешно отправлено!",
    });
  } catch (error) {
    console.error("❌ Error sending message to Telegram:", error);
    return res.status(500).json({
      success: false,
      message: "Ошибка при отправке сообщения. Попробуйте позже.",
    });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("❌ Unhandled Error:", err);
  res
    .status(500)
    .json({ success: false, message: "Внутренняя ошибка сервера" });
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
