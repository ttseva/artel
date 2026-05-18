import express from "express";
import { createOrder, getOrders, updateOrderStatus } from "../controllers/order.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", authMiddleware, createOrder);
router.get("/", authMiddleware, getOrders);
router.patch("/:id/status", authMiddleware, updateOrderStatus);

export default router;
