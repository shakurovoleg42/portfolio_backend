require("dotenv").config();
const mongoose = require("mongoose");
const slugify = require("slugify");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);
  }
};

// Схема и модель для портфолио
const portfolioSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    technologies: [String],
    slug: { type: String, unique: true },
    list: [String],
    images: [String],
  },
  { collection: "portfolioDB" }
);

// Middleware для создания уникального slug
portfolioSchema.pre("save", async function (next) {
  if (this.isNew) {
    let slug = slugify(this.title, { lower: true, strict: true });
    const slugExists = await Portfolio.findOne({ slug });
    if (slugExists) {
      slug = `${slug}-${Date.now()}`;
    }
    this.slug = slug;
  }
  next();
});

const Portfolio = mongoose.model("Portfolio", portfolioSchema);

module.exports = { connectDB, Portfolio };
