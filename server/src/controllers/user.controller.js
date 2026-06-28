import User from "../models/User.js";
import { isNonEmptyString, isValidEmail } from "../utils/validation.js";

export const updateUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userId = req.user._id;

    if (name !== undefined && !isNonEmptyString(name)) {
      return res.status(400).json({ message: "Name must be a non-empty string" });
    }

    if (email !== undefined && !isValidEmail(email)) {
      return res.status(400).json({ message: "Valid email is required" });
    }

    if (password !== undefined) {
      if (!isNonEmptyString(password)) {
        return res.status(400).json({ message: "Password must be a non-empty string" });
      }
      if (password.trim().length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password = password;

    await user.save();

    const updatedUser = await User.findById(userId).select("-password");
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
