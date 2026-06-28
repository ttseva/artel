import Message from "../models/Message.js";
import Order from "../models/Order.js";
import { isNonEmptyString, isValidObjectId } from "../utils/validation.js";

export const getMessages = async (req, res) => {
  try {
    const { id: orderId } = req.params;
    const userId = req.user._id;

    if (!isValidObjectId(orderId)) {
      return res.status(400).json({ message: "Invalid order id" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const isBuyer = order.buyerId.toString() === userId.toString();
    const isMaster = order.masterId.toString() === userId.toString();

    if (!isBuyer && !isMaster) {
      return res
        .status(403)
        .json({ message: "No access to chat of this order" });
    }

    const messages = await Message.find({ orderId })
      .populate("senderId", "name")
      .sort({ createdAt: 1 }); // сортировка по возрастанию (старые сначала)

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { id: orderId } = req.params;
    const { text } = req.body;
    const senderId = req.user._id;

    if (!isValidObjectId(orderId)) {
      return res.status(400).json({ message: "Invalid order id" });
    }

    if (!isNonEmptyString(text)) {
      return res.status(400).json({ message: "Message text is required" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const isBuyer = order.buyerId.toString() === senderId.toString();
    const isMaster = order.masterId.toString() === senderId.toString();

    if (!isBuyer && !isMaster) {
      return res
        .status(403)
        .json({ message: "No access to send messages in this order" });
    }

    const message = await Message.create({
      orderId,
      senderId,
      text: text.trim(),
    });

    const populatedMessage = await Message.findById(message._id).populate(
      "senderId",
      "name",
    );
    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
