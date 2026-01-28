import { useEffect, useState } from 'react';

interface CoinFlipProps {
  onResult: (result: 'player' | 'ai') => void;
}

export default function CoinFlip({ onResult }: CoinFlipProps) {
  const [flipping, setFlipping] = useState(true);
  const [side, setSide] = useState<'player' | 'ai'>('player');

  useEffect(() => {
    let count = 0;
    const interval = setInterval(() => {
      setSide((prev) => (prev === 'player' ? 'ai' : 'player'));
      count++;
      if (count > 15) {
        clearInterval(interval);
        const result = Math.random() < 0.5 ? 'player' : 'ai';
        setSide(result);
        setFlipping(false);
        setTimeout(() => onResult(result), 1000);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [onResult]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="flex flex-col items-center">
        <div
          className={`w-32 h-32 rounded-full flex items-center justify-center text-4xl font-bold shadow-lg transition-transform duration-200 ${
            flipping ? 'animate-spin' : ''
          } ${side === 'player' ? 'bg-blue-200' : 'bg-red-200'}`}
        >
          {side === 'player' ? 'あなた' : 'AI'}
        </div>
        <div className="mt-4 text-white text-lg font-semibold">
          {flipping ? 'コイントス中...' : `${side === 'player' ? 'あなた' : 'AI'} が先手！`}
        </div>
      </div>
    </div>
  );
}
