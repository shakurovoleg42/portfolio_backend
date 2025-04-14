const express = require("express");
const upload = require("../config/multer");
const Portfolio = require("../models/Portfolio");

const router = express.Router();

// 📄 Получение всех работ
router.get("/api/portfolio", async (req, res) => {
  try {
    const portfolio = await Portfolio.findAll();
    res.render("index", { portfolio }); // отрисовываем EJS
  } catch (err) {
    console.error("Error fetching portfolios:", err);
    res.status(500).send("Server Error");
  }
});

// 🟢 Получение работы по slug
router.get("/api/portfolio/slug/:slug", async (req, res) => {
  const { slug } = req.params;
  try {
    const portfolio = await Portfolio.findOne({ where: { slug } });
    if (!portfolio) return res.status(404).send("Portfolio not found");
    res.json(portfolio);
    console.log("Portfolio found:", portfolio);
  } catch (err) {
    console.error("Error fetching portfolio:", err);
    res.status(500).send("Server Error");
  }
});

// ➕ Форма добавления работы
router.get("/api/portfolio/add", (req, res) => {
  res.render("create");
});

// ✅ Обработка добавления
router.post("/api/portfolio", upload.array("images", 10), async (req, res) => {
  const { slug, title, description, technologies, list, linkToOriginal } =
    req.body;
  const images = req.files.map((file) => `/uploads/${file.filename}`);
  try {
    await Portfolio.create({
      slug: title.toLowerCase().replace(/\s+/g, "-"),
      title,
      description,
      technologies: technologies.split(","),
      list: list.split(","),
      images,
      linkToOriginal,
    });
    res.redirect("/api/portfolio");
  } catch (err) {
    console.error("Error adding portfolio:", err);
    res.status(500).send("Server Error");
  }
});

// ✏️ Форма редактирования
router.get("/api/portfolio/edit/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const item = await Portfolio.findByPk(id);
    if (!item) return res.status(404).send("Portfolio not found");
    res.render("edit", { item });
  } catch (err) {
    console.error("Error fetching portfolio:", err);
    res.status(500).send("Server Error");
  }
});

// ♻️ Обновление
router.post(
  "/api/portfolio/update/:id",
  upload.array("images", 10),
  async (req, res) => {
    const { id } = req.params;
    const {
      title,
      description,
      technologies,
      list,
      oldImages,
      linkToOriginal,
    } = req.body;

    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map((file) => `/uploads/${file.filename}`);
    } else if (oldImages) {
      images = JSON.parse(oldImages);
    }

    try {
      await Portfolio.update(
        {
          title,
          description,
          technologies: technologies.split(","),
          list: list.split(","),
          images,
          linkToOriginal,
        },
        { where: { id } }
      );
      res.redirect("/api/portfolio");
    } catch (err) {
      console.error("Error updating portfolio:", err);
      res.status(500).send("Server Error");
    }
  }
);

// ❌ Удаление
router.post("/api/portfolio/delete/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await Portfolio.destroy({ where: { id } });
    res.redirect("/api/portfolio");
  } catch (err) {
    console.error("Error deleting portfolio:", err);
    res.status(500).send("Server Error");
  }
});

// 📄 Получить все работы (JSON)
router.get("/api/json/portfolio", async (req, res) => {
  try {
    const data = await Portfolio.findAll();
    res.json(data);
  } catch (err) {
    console.error("JSON API error (get all):", err);
    res.status(500).json({ error: "Server error" });
  }
});

// 🔍 Получить одну работу по ID (JSON)
router.get("/api/json/portfolio/:id", async (req, res) => {
  try {
    const item = await Portfolio.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json(item);
  } catch (err) {
    console.error("JSON API error (get by ID):", err);
    res.status(500).json({ error: "Server error" });
  }
});

// 🔎 Получить одну работу по slug (JSON)
router.get("/api/json/portfolio/slug/:title", async (req, res) => {
  try {
    const item = await Portfolio.findOne({
      where: { title: req.params.title },
    });
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json(item);
  } catch (err) {
    console.error("JSON API error (get by slug):", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
