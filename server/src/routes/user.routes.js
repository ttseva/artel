import express from "express";

const router = express.Router();

router.get("/me", (req, res) => {
    res.json({ message: "Информация о пользователе" });
});

export default router;