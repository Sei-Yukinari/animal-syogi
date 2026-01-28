import React from 'react';

interface PromotionModalProps {
  pieceType: string;
  onConfirm: (promote: boolean) => void;
}

export default function PromotionModal({ pieceType, onConfirm }: PromotionModalProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-lg p-6 shadow-lg w-72 text-center">
        <div className="text-lg font-bold mb-4">成りますか？</div>
        <div className="mb-4">この{pieceType}を成りますか？</div>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => onConfirm(true)}
            className="px-4 py-2 bg-amber-400 text-white rounded-lg font-bold"
          >
            成る
          </button>
          <button
            onClick={() => onConfirm(false)}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-bold"
          >
            成らない
          </button>
        </div>
      </div>
    </div>
  );
}
