import React from "react";
import { FiChevronLeft, FiChevronRight, FiX } from "react-icons/fi";

interface Props {
  images: string[];
  index: number;
  onClose: () => void;
  onChangeIndex: (newIndex: number) => void;
}

export default function ImageViewerModal({ images, index, onClose, onChangeIndex }: Props) {
  if (!images || images.length === 0) return null;

  const handlePrev = () => {
    onChangeIndex((index - 1 + images.length) % images.length);
  };

  const handleNext = () => {
    onChangeIndex((index + 1) % images.length);
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onClose}
    >
        <button className="absolute top-4 right-4 text-white text-2xl" onClick={onClose}>
            <FiX />
        </button>

        <div
            className="relative w-full max-w-4xl h-[80vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
            >
            <button
                onClick={handlePrev}
                className="absolute left-2 z-10 text-white text-3xl"
            >
                <FiChevronLeft />
            </button>

            <img
                src={images[index]}
                alt={`image-${index}`}
                className="max-h-full max-w-full object-contain rounded-md"
            />

            <button
                onClick={handleNext}
                className="absolute right-2 z-10 text-white text-3xl"
            >
                <FiChevronRight />
            </button>
        </div>
    </div>
  );
}

