const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
require("dotenv").config();
const sequelize = require("./config/db"); // Добавляем подключение к базе данных через Sequelize

const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(cors()); // Разрешаем CORS для всех маршрутов
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// Устанавливаем EJS как шаблонизатор
app.set("view engine", "ejs");

// Подключаем роуты
const portfolioRoutes = require("./routes/portfolio");
const telegramBot = require("./routes/telegram");

app.use("/", portfolioRoutes);
app.use("/api/telegram", telegramBot);

// Инициализация базы данных (синхронизация)
sequelize
  .sync({ force: false }) // Если хочешь пересоздать таблицы, укажи { force: true }
  .then(() => {
    console.log("Database connected successfully");
    app.listen(port, () => {
      console.log(`🚀 Server is running on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("Error connecting to database:", err);
  });

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});
