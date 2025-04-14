const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
require("dotenv").config();
const sequelize = require("./config/db");

const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Статика (для фронта и изображений)
app.use(express.static(path.join(__dirname, "public"))); // общий доступ ко всему public
app.use("/uploads", express.static(path.join(__dirname, "public/uploads"))); // явный доступ к картинкам

// EJS setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Routes
const portfolioRoutes = require("./routes/portfolio");
const telegramBot = require("./routes/telegram");

app.use("/", portfolioRoutes);
app.use("/api/telegram", telegramBot);

// DB sync and server start
sequelize
  .authenticate()
  .then(() => {
    console.log("✅ PostgreSQL connection established.");
    return sequelize.sync(); // ❗ без force: true
  })
  .then(() => {
    console.log("✅ Models synchronized with DB.");
    app.listen(port, () => {
      console.log(`🚀 Server running on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("❌ Error with database connection:", err);
    process.exit(1);
  });

// Global error handler
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});
