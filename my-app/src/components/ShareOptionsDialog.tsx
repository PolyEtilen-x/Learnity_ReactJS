import { createPortal } from "react-dom";

interface ShareOptionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onInternalShare: () => void;
  onExternalShare: () => void;
}

export default function ShareOptionsDialog({
  isOpen,
  onClose,
  onInternalShare,
  onExternalShare,
}: ShareOptionsDialogProps) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-4 shadow-lg max-w-sm w-full">
        <h2 className="text-lg font-bold mb-3">Chia sẻ bài viết</h2>
        <button
          className="w-full text-left py-2 px-3 hover:bg-gray-100 rounded"
          onClick={() => {
            onInternalShare();
            onClose();
          }}
        >
          📌 Chia sẻ trong ứng dụng
        </button>
        <button
          className="w-full text-left py-2 px-3 hover:bg-gray-100 rounded"
          onClick={() => {
            onExternalShare();
            onClose();
          }}
        >
          🌐 Chia sẻ ra ngoài
        </button>
        <button
          className="w-full mt-3 text-sm text-gray-500 underline"
          onClick={onClose}
        >
          Đóng
        </button>
      </div>
    </div>,
    document.body
  );
}
