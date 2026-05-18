import "dotenv/config";
import dns from "node:dns";
import mongoose from "mongoose";

import app from "./src/app.js";

const PORT = process.env.PORT || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/artel";

dns.setServers(["1.1.1.1", "1.0.0.1"]);

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Connection error:", err);
    process.exit(1);
  });
