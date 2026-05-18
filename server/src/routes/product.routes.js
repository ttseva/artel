import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "Каталог" });
});

router.post("/", (req, res) => {
  res.json({ message: "Создать товар" });
});

router.get("/:id", (req, res) => {
  res.json({ message: "Получить товар" });
});

router.put("/:id", (req, res) => {
  res.json({ message: "Обновить товар" });
});

router.delete("/:id", (req, res) => {
  res.json({ message: "Удалить товар" });
});

export default router;
