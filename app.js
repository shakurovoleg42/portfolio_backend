const express = require("express");
const { connectDB } = require("./mongo");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors"); // Import CORS middleware

const app = express();
const port = 8080;

// Подключение к MongoDB
connectDB();

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));

// Устанавливаем EJS как шаблонизатор
app.set("view engine", "ejs");

// Подключаем роуты
const portfolioRoutes = require("./routes/portfolio");
app.use("/", portfolioRoutes);

// Запуск сервера
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
