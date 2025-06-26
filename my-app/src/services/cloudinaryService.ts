export const getCloudinaryConfig = () => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  const uploadFolder = "Learnity/Posts";

  if (!cloudName || !uploadPreset) {
    throw new Error("Missing Cloudinary config in .env");
  }

  return {
    cloudName,
    uploadPreset,
    uploadFolder,
    uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, // 
  };
};
