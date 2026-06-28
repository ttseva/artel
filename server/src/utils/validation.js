import mongoose from "mongoose";

export const ORDER_STATUSES = [
  "created",
  "in_progress",
  "completed",
  "cancelled",
];

export const PRODUCT_CATEGORIES = [
  "jewelry",
  "decor",
  "clothing",
  "accessories",
];

export const isValidObjectId = (id) => mongoose.isValidObjectId(id);

export const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;

export const isValidEmail = (email) =>
  typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

export const isPositiveNumber = (value) =>
  typeof value === "number" && Number.isFinite(value) && value > 0;
