import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { envVar } from "./env";
import AppError from "../ErrorHelpers/AppError";
import status from "http-status";

cloudinary.config({
  cloud_name: envVar.CLOUDINARY.CLOUDINARY_CLOUD_NAME,
  api_key: envVar.CLOUDINARY.CLOUDINARY_API_KEY,
  api_secret: envVar.CLOUDINARY.CLOUDINARY_API_SECRET,
});

export const uploadFileToCloudinary = async (
  buffer: Buffer,
  fileName: string,
): Promise<UploadApiResponse> => {
  if (!buffer || !fileName) {
    throw new AppError(
      status.BAD_REQUEST,
      "File buffer and file name is required!",
    );
  }
  const extension = fileName.split(".").pop()?.toLowerCase();
  const fileNameWithoutExtension = fileName
    .split(".")
    .slice(0, -1)
    .join(".")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "");

  const uniqueName =
    Math.random().toString(36).substring(2) +
    "-" +
    Date.now() +
    "-" +
    fileNameWithoutExtension;

  const folder = extension === "pdf" ? "pdfs" : "images";
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: `ph-healthcare/${folder}`,
          public_id: `ph-healthcare/${folder}/${uniqueName}`,
          resource_type: "auto",
        },
        (error, result) => {
          if (error) {
            throw new AppError(
              status.INTERNAL_SERVER_ERROR,
              "Failed to upload file to cloudinary",
            );
          }
          resolve(result as UploadApiResponse);
        },
      )
      .end(buffer);
  });
};

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
