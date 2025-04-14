// routes/portfolio.js
const express = require("express");
const upload = require("../config/multer");
const Portfolio = require("../models/Portfolio"); // Модель для работы с PostgreSQL

const router = express.Router();

// Получение всех работ (Read)
router.get("/api/portfolio", async (req, res) => {
  try {
    const portfolio = await Portfolio.findAll(); // Получаем все записи
    res.json(portfolio);
  } catch (err) {
    console.error("Error fetching portfolios:", err);
    res.status(500).send("Server Error");
  }
});

// Получение работы по slug
router.get("/api/portfolio/:slug", async (req, res) => {
  const { slug } = req.params;
  try {
    const portfolio = await Portfolio.findOne({
      where: { slug },
    });
    if (!portfolio) {
      return res.status(404).send("Portfolio not found");
    }
    res.json(portfolio);
  } catch (err) {
    console.error("Error fetching portfolio:", err);
    res.status(500).send("Server Error");
  }
});

// Главная страница (Read)
router.get("/", async (req, res) => {
  try {
    const portfolio = await Portfolio.findAll(); // Получаем все работы
    res.render("index", { portfolio });
  } catch (err) {
    console.error("Error fetching portfolio:", err);
    res.status(500).send("Server Error");
  }
});

// Форма добавления работы (Create)
router.get("/portfolio/add", (req, res) => {
  res.render("create");
});

// Обработка формы добавления работы (Create)
router.post("/portfolio", upload.array("images", 10), async (req, res) => {
  const { title, description, technologies, list, linkToOriginal } = req.body;
  const images = req.files.map((file) => `/uploads/${file.filename}`);

  try {
    const portfolio = await Portfolio.create({
      title,
      description,
      technologies: technologies.split(","),
      list: list.split(","),
      images,
      linkToOriginal,
    });
    res.redirect("/");
  } catch (err) {
    console.error("Error adding portfolio:", err);
    res.status(500).send("Server Error");
  }
});

// Форма редактирования работы
router.get("/portfolio/edit/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const item = await Portfolio.findByPk(id); // Поиск по ID
    if (!item) {
      return res.status(404).send("Portfolio not found");
    }
    res.render("edit", { item });
  } catch (err) {
    console.error("Error fetching portfolio:", err);
    res.status(500).send("Server Error");
  }
});

// Обновление работы (Update)
router.post(
  "/portfolio/update/:id",
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
      res.redirect("/");
    } catch (err) {
      console.error("Error updating portfolio:", err);
      res.status(500).send("Server Error");
    }
  }
);

// Удаление работы (Delete)
router.post("/portfolio/delete/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await Portfolio.destroy({ where: { id } });
    res.redirect("/");
  } catch (err) {
    console.error("Error deleting portfolio:", err);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
