import React from "react";

interface Props {
  url: string;
  isOnline?: boolean;
  size?: number; // pixel, default = 56
}

const MediumProfileImage: React.FC<Props> = ({
  url,
  isOnline = false,
  size = 56,
}) => {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <img
        src={url || "/default-avatar.png"}
        alt="avatar"
        className="rounded-full object-cover w-full h-full border"
        style={{
          borderColor: isOnline ? "limegreen" : "gray",
          borderWidth: "2px",
        }}
      />
      {isOnline && (
        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-black rounded-full" />
      )}
    </div>
  );
};

export default MediumProfileImage;
