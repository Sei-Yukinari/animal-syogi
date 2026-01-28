'use client';

import { Player } from '@/types/game';
import { useEffect, useState } from 'react';

interface VictoryModalProps {
  winner: Player;
  onReset: () => void;
}

export default function VictoryModal({ winner, onReset }: VictoryModalProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // 少し遅延してからモーダルを表示
    const timer = setTimeout(() => setShow(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const isPlayerWin = winner === 'player';

  return (
    <>
      {/* オーバーレイ */}
      <div
        className={`
          fixed inset-0 bg-black transition-opacity duration-500 z-40
          ${show ? 'opacity-50' : 'opacity-0'}
        `}
      />

      {/* 勝利モーダル */}
      <div
        className={`
          fixed inset-0 flex items-center justify-center z-50
          transition-all duration-700
          ${show ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}
        `}
      >
        <div
          className={`
            bg-gradient-to-br from-white via-yellow-50 to-orange-50 rounded-3xl shadow-2xl p-2 sm:p-10 max-w-[220px] sm:max-w-lg mx-1 sm:mx-4
            transform transition-all duration-700 border-4
            ${show ? 'translate-y-0' : 'translate-y-10'}
            ${isPlayerWin ? 'border-yellow-400' : 'border-blue-400'}
          `}
        >
          {/* 勝利メッセージ */}
          <div
            className={`
              text-center mb-8
              animate-bounce
            `}
          >
            <div className="text-8xl mb-6 drop-shadow-lg">
              {isPlayerWin ? '🎉' : '😢'}
            </div>
            <h2
              className={`
                text-5xl font-bold mb-4 drop-shadow-md
                ${isPlayerWin ? 'text-amber-600' : 'text-blue-600'}
              `}
            >
              {isPlayerWin ? 'あなたの勝ち！' : 'AIの勝ち'}
            </h2>
            <p className="text-xl text-amber-800 font-semibold">
              {isPlayerWin
                ? 'すばらしい！よくできました！'
                : 'もう一度挑戦してみましょう！'}
            </p>
          </div>

          {/* ボタン */}
          <button
            onClick={onReset}
            className={`
              w-full py-5 rounded-xl font-bold text-white text-xl
              transition-all duration-200 border-3
              ${
                isPlayerWin
                  ? 'bg-gradient-to-r from-yellow-400 via-orange-400 to-orange-500 hover:from-yellow-500 hover:via-orange-500 hover:to-orange-600 border-yellow-500'
                  : 'bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 hover:from-blue-500 hover:via-blue-600 hover:to-blue-700 border-blue-500'
              }
              transform hover:scale-105 active:scale-95
              shadow-xl hover:shadow-2xl
            `}
          >
            🔄 もう一度プレイ
          </button>
        </div>
      </div>
    </>
  );
}
