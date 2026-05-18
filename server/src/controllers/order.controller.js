import Order from "../models/Order.js";
import Product from "../models/Product.js";

export const createOrder = async (req, res) => {
  try {
    const { productId, comment } = req.body;
    const buyerId = req.user._id;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const newOrder = new Order({
      buyerId,
      masterId: product.masterId,
      productId,
      status: "created",
      comment: comment?.trim() || "",
    });

    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrders = async (req, res) => {
  try {
    const userId = req.user._id;

    const orders = await Order.find({
      $or: [{ buyerId: userId }, { masterId: userId }],
    })
      .populate("productId", "title price image")
      .populate("buyerId", "name email")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const order = await Order.findById(id)
      .populate("productId", "title price image category")
      .populate("buyerId", "name email")
      .populate("masterId", "name email");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.buyerId._id.toString() !== userId.toString() && order.masterId._id.toString() !== userId.toString()) {
      return res.status(403).json({ message: "No access to this order" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user._id;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.masterId.toString() !== userId) {
      return res.status(403).json({ message: "No access to change status" });
    }

    order.status = status;
    await order.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
