import express from "express";

const router = express.Router();

router.post("/", (req, res) => {
  res.json({ message: "Создать заказ" });
});

router.get("/", (req, res) => {
  res.json({ message: "Получить список заказов" });
});

router.patch("/:id/status", (req, res) => {
  res.json({ message: "Обновить статус заказа" });
});

export default router;
