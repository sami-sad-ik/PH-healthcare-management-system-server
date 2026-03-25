import { v2 as cloudinary } from "cloudinary";
import { envVar } from "./env";
import AppError from "../ErrorHelpers/AppError";
import status from "http-status";

cloudinary.config({
  cloud_name: envVar.CLOUDINARY.CLOUDINARY_CLOUD_NAME,
  api_key: envVar.CLOUDINARY.CLOUDINARY_API_KEY,
  api_secret: envVar.CLOUDINARY.CLOUDINARY_API_SECRET,
});

export const deleteFileFromCloudinary = async (url: string) => {
  try {
    const regex = /\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-zA-Z0-9]+)?$/;
    const match = url.match(regex);
    if (match && match[1]) {
      const publicId = match[1];
      const resourceType = publicId.includes("ph-healthcare/pdfs")
        ? "raw"
        : "image";
      await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
      });
      console.log(`Image ${publicId} is deleted from cloudinary`);
    }
  } catch (error) {
    console.log(error);
    throw new AppError(
      status.INTERNAL_SERVER_ERROR,
      "Failed to delete from cloudinary!",
    );
  }
};

export const cloudinaryUpload = cloudinary;
