// mongo.js
const mongoose = require("mongoose");

// Подключение к MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/portfolioDB", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1); // Завершить процесс с ошибкой
  }
};

// Схема и модель для портфолио
const portfolioSchema = new mongoose.Schema({
  title: String,
  description: String,
  technologies: [String],
  list: [String],
  images: [String],
});

const Portfolio = mongoose.model("Portfolio", portfolioSchema);

module.exports = { connectDB, Portfolio };
