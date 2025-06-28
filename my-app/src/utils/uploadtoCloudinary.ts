import axios from "axios";
import { getCloudinaryConfig } from "../services/cloudinaryService";

export const uploadImageToCloudinary = async (file: File, fileName?: string): Promise<string> => {
  const { uploadPreset, uploadFolder, uploadUrl } = getCloudinaryConfig();

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", uploadFolder);
  if (fileName) formData.append("public_id", fileName);

  try {
    const res = await axios.post(uploadUrl, formData);
    if (!res.data.secure_url) throw new Error("No URL returned");
    return res.data.secure_url;
  } catch (error) {
    console.error("❌ Error uploading to Cloudinary:", error);
    throw new Error("Không thể tải ảnh lên máy chủ.");
  }
};
