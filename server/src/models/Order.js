import mongoose from "mongoose";

const Schema = mongoose.Schema;

const orderSchema = new Schema({
  buyerId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  masterId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  productId: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  status: {
    type: String,
    enum: ["created", "in_progress", "completed", "cancelled"],
    default: "created",
  },
  comment: {
    type: String,
    default: "",
  },
}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);
export default Order;