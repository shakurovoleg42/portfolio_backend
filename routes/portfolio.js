const express = require("express");
const { Portfolio } = require("../mongo");
const upload = require("../config/multer");
const {
  getAllPortfolios,
  getPortfolioBySlug,
} = require("../controllers/portfolioController");

const router = express.Router();

// Controllers
router.get("/api/portfolio", getAllPortfolios);
router.get("/api/portfolio/:slug", getPortfolioBySlug);

// Controllers End

// Главная страница (Read)
router.get("/", async (req, res) => {
  try {
    const portfolio = await Portfolio.find({});
    res.render("index", { portfolio });
  } catch (err) {
    console.error("Error fetching portfolio:", err);
    res.status(500).send("Server Error");
  }
});

// Форма добавления работы
router.get("/portfolio/add", (req, res) => {
  res.render("create");
});

// Обработка формы добавления работы (Create)
router.post("/portfolio", upload.array("images", 10), async (req, res) => {
  const { title, description, technologies, list } = req.body;
  const images = req.files.map((file) => `/uploads/${file.filename}`);

  const portfolio = new Portfolio({
    title,
    description,
    technologies: technologies.split(","),
    list: list.split(","),
    images,
  });

  try {
    await portfolio.save();
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
    const item = await Portfolio.findById(id);
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
    const { title, description, technologies, list } = req.body;
    const images = req.files.map((file) => `/uploads/${file.filename}`);

    try {
      await Portfolio.findByIdAndUpdate(id, {
        title,
        description,
        technologies: technologies.split(","),
        list: list.split(","),
        images,
      });
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
    await Portfolio.findByIdAndDelete(id);
    res.redirect("/");
  } catch (err) {
    console.error("Error deleting portfolio:", err);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
