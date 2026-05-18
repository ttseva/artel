import express from "express";

const router = express.Router({ mergeParams: true });

router.get("/", (req, res) => {
  res.json({
    message: "Получить сообщения заказа",
    orderId: req.params.id,
  });
});

router.post("/", (req, res) => {
  res.json({
    message: "Отправить сообщение в заказ",
    orderId: req.params.id,
  });
});

export default router;
