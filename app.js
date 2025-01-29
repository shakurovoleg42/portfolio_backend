const express = require("express");
const { connectDB, Portfolio } = require("./mongo"); // Импорт из mongo.js
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
const app = express();
const port = 3000;

// Подключение к MongoDB
connectDB();

// Настройка Multer для загрузки файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/"); // Папка для сохранения файлов
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // Уникальное имя файла
  },
});

const upload = multer({ storage });

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public")); // Для обслуживания статических файлов

// Устанавливаем EJS как шаблонизатор
app.set("view engine", "ejs");

// Главная страница (Read)
app.get("/", async (req, res) => {
  try {
    const portfolio = await Portfolio.find({}); // Получить все записи из коллекции
    res.render("index", { portfolio });
  } catch (err) {
    console.error("Error fetching portfolio:", err);
    res.status(500).send("Server Error");
  }
});

// Форма добавления работы
app.get("/portfolio/add", (req, res) => {
  res.render("create"); // Рендерим форму добавления
});

// Обработка формы добавления работы (Create)
app.post("/portfolio", upload.array("images", 10), async (req, res) => {
  const { title, description, technologies, list } = req.body;
  const images = req.files.map((file) => `/uploads/${file.filename}`); // Пути к загруженным файлам

  const portfolio = new Portfolio({
    id,
    title,
    description,
    technologies: technologies.split(","), // Преобразуем строку в массив
    list: list.split(","), // Преобразуем строку в массив
    images, // Массив путей к изображениям
  });

  try {
    await portfolio.save(); // Сохранить запись в MongoDB
    res.redirect("/");
  } catch (err) {
    console.error("Error adding portfolio:", err);
    res.status(500).send("Server Error");
  }
});

// Форма редактирования работы
app.get("/portfolio/edit/:id", async (req, res) => {
  const { id } = req.params;
  console.log(id);

  try {
    const item = await Portfolio.findById(id);
    res.render("edit", { item });
  } catch (err) {
    console.error("Error fetching portfolio:", err);
    res.status(500).send("Server Error");
  }
});

app.post(
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
app.post("/portfolio/delete/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await Portfolio.findByIdAndDelete(id); // Удалить запись по ID
    res.redirect("/");
  } catch (err) {
    console.error("Error deleting portfolio:", err);
    res.status(500).send("Server Error");
  }
});

// Запуск сервера
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
