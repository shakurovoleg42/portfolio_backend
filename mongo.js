const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const portfolioSchema = new mongoose.Schema({
  id: {
    type: String,
    default: uuidv4,
  },
  title: String,
  description: String,
  technologies: [String],
  list: [String],
  images: [String],
});

const Portfolio = mongoose.model("Portfolio", portfolioSchema);

module.exports = Portfolio;
