import express from "express";
import { updateUser } from "../controllers/user.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/me", authMiddleware, (req, res) => {
  res.json(req.user);
});

router.put("/me", authMiddleware, updateUser);

export default router;
