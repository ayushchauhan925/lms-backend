const cloudinary = require("cloudinary").v2;

const connectCloudinary = () => {
  try {
    cloudinary.config({
      cloudinary_url: process.env.CLOUDINARY_URL
    });

    console.log("✅ Cloudinary Connected Successfully");
  } catch (error) {
    console.error("❌ Cloudinary Connection Failed:", error.message);
    process.exit(1);
  }
};

module.exports = {
  cloudinary,
  connectCloudinary,
};