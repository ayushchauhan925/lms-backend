const dotenv = require("dotenv");
dotenv.config(); // Always load first

const app = require("./app");
const connectDB = require("./src/config/db");
const { connectCloudinary } = require("./src/config/cloudinary");

// Connect Database
connectDB();

// Connect Cloudinary
connectCloudinary();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🔥 Server running on port ${PORT}`);
});