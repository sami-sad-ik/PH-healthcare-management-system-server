import { v2 as cloudinary } from "cloudinary";
import { envVar } from "./env";

cloudinary.config({
  cloud_name: envVar.CLOUDINARY.CLOUDINARY_CLOUD_NAME,
  api_key: envVar.CLOUDINARY.CLOUDINARY_API_KEY,
  api_secret: envVar.CLOUDINARY.CLOUDINARY_API_SECRET,
});

export const cloudinaryUpload = cloudinary;
