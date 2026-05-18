import express from "express";

const router = express.Router();

router.post("/register", (req, res) => {
  res.json({ message: "Регистрация" });
});

router.post("/login", (req, res) => {
  res.json({ message: "Вход" });
});

export default router;
