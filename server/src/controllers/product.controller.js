import Product from "../models/Product.js";

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("masterId", "name email")
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id).populate(
      "masterId",
      "name email",
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { title, description, price, image, category } = req.body;
    const masterId = req.user._id;

    if (req.user.role !== "master") {
      return res
        .status(403)
        .json({ message: "Only masters can create products" });
    }

    const product = await Product.create({
      masterId,
      title,
      description,
      price,
      image,
      category,
    });

    const populatedProduct = await Product.findById(product._id).populate(
      "masterId",
      "name email",
    );
    res.status(201).json(populatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, image, category } = req.body;
    const userId = req.user._id;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.masterId.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "No access to edit this product" });
    }

    if (title !== undefined) product.title = title;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = price;
    if (image !== undefined) product.image = image;
    if (category !== undefined) product.category = category;

    await product.save();

    const updatedProduct = await Product.findById(id).populate(
      "masterId",
      "name email",
    );
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.masterId.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "No access to delete this product" });
    }

    await Product.findByIdAndDelete(id);
    res.json({ message: "Product successfully deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
