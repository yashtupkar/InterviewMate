const { v2: cloudinary } = require("cloudinary");
const ApiError = require("../utils/ApiError");

let isConfigured = false;

const ensureCloudinaryConfig = () => {
  if (isConfigured) return;

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new ApiError(
      500,
      "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
    );
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });

  isConfigured = true;
};

const uploadImageBuffer = async ({
  buffer,
  mimetype,
  folder = "interviewmate/blogs",
}) => {
  ensureCloudinaryConfig();

  const dataUri = `data:${mimetype};base64,${buffer.toString("base64")}`;
  const uploaded = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: "image",
    overwrite: false,
  });

  return {
    url: uploaded.secure_url,
    publicId: uploaded.public_id,
    width: uploaded.width,
    height: uploaded.height,
    format: uploaded.format,
  };
};

module.exports = {
  uploadImageBuffer,
};
