import mongoose from "mongoose";
import dns from "node:dns";

const connectDB = async () => {
  try {
    dns.setServers(["1.1.1.1", "1.0.0.1"]);
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

export default connectDB;
