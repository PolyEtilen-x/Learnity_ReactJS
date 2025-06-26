import axios from "axios";
import { getCloudinaryConfig } from "../services/cloudinaryService";

export const uploadImageToCloudinary = async (file: File): Promise<string | null> => {
  const { uploadPreset, uploadFolder, uploadUrl } = getCloudinaryConfig();

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", uploadFolder);

  try {
    const res = await axios.post(uploadUrl, formData);
    return res.data.secure_url;
  } catch (error) {
    console.error("❌ Error uploading to Cloudinary:", error);
    return null;
  }
};
