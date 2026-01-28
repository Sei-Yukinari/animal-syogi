'use client';

import { useEffect, useState } from 'react';

interface ConfettiProps {
  active: boolean;
}

interface ConfettiPiece {
  id: number;
  left: number;
  animationDuration: number;
  backgroundColor: string;
  delay: number;
}

export default function Confetti({ active }: ConfettiProps) {
  const [confettiPieces, setConfettiPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (!active) return;

    const colors = [
      '#FFD700', // 金
      '#FF69B4', // ピンク
      '#00CED1', // 水色
      '#FF6347', // トマト色
      '#32CD32', // ライムグリーン
      '#FF8C00', // オレンジ
      '#9370DB', // 紫
      '#FFB6C1', // ライトピンク
    ];

    // 紙吹雪を生成
    const pieces: ConfettiPiece[] = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      animationDuration: 2 + Math.random() * 3,
      backgroundColor: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 0.5,
    }));

    setConfettiPieces(pieces);
  }, [active]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {confettiPieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute top-0 w-3 h-3 opacity-90"
          style={{
            left: `${piece.left}%`,
            backgroundColor: piece.backgroundColor,
            animation: `fall ${piece.animationDuration}s linear infinite`,
            animationDelay: `${piece.delay}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes fall {
          0% {
            transform: translateY(-10px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0.3;
          }
        }
      `}</style>
    </div>
  );
}
