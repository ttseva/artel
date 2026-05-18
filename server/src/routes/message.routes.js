import express from "express";
import { getMessages, sendMessage } from "../controllers/message.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router({ mergeParams: true });

router.get("/", authMiddleware, getMessages);
router.post("/", authMiddleware, sendMessage);

export default router;
