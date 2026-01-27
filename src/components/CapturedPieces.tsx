import { PieceType, Player } from '@/types/game';

interface CapturedPiecesProps {
  pieces: PieceType[];
  player: Player;
  isCurrentPlayer: boolean;
  selectedPiece: PieceType | null;
  onSelectPiece: (pieceType: PieceType) => void;
}

// 駒の絵文字マッピング
const PIECE_EMOJI: Record<PieceType, string> = {
  lion: '🦁',
  giraffe: '🦒',
  elephant: '🐘',
  chick: '🐤',
  chicken: '🐔',
};

// 駒の日本語名
const PIECE_NAME: Record<PieceType, string> = {
  lion: 'ライオン',
  giraffe: 'キリン',
  elephant: 'ゾウ',
  chick: 'ヒヨコ',
  chicken: 'ニワトリ',
};

export default function CapturedPieces({
  pieces,
  player,
  isCurrentPlayer,
  selectedPiece,
  onSelectPiece,
}: CapturedPiecesProps) {
  const isAI = player === 'ai';

  // 駒の種類ごとにカウント
  const pieceCounts = pieces.reduce((acc, piece) => {
    acc[piece] = (acc[piece] || 0) + 1;
    return acc;
  }, {} as Record<PieceType, number>);

  return (
    <div
      className={`
        bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 rounded-2xl shadow-lg p-5 border-3 border-amber-200
        min-w-[400px]
        ${isAI ? 'rotate-180' : ''}
      `}
    >
      <div className="text-base font-bold mb-3 text-amber-900">
        {player === 'player' ? '🙂 先手の持ち駒' : '🤖 後手の持ち駒'}
      </div>
      <div className="flex flex-wrap gap-3 min-h-[80px]">
        {pieces.length === 0 ? (
          <div className="text-gray-400 text-base italic">なし</div>
        ) : (
          Object.entries(pieceCounts).map(([pieceType, count]) => (
            <button
              key={pieceType}
              onClick={() => onSelectPiece(pieceType as PieceType)}
              disabled={!isCurrentPlayer}
              className={`
                flex items-center gap-2 px-4 py-3 rounded-xl
                transition-all duration-200
                border-2
                ${
                  isCurrentPlayer
                    ? 'hover:bg-sky-100 hover:border-sky-300 cursor-pointer hover:scale-105'
                    : 'opacity-40 cursor-not-allowed'
                }
                ${
                  selectedPiece === pieceType
                    ? 'bg-sky-200 border-sky-400 ring-4 ring-sky-300 scale-105'
                    : 'bg-white border-amber-200'
                }
                shadow-md
              `}
              title={PIECE_NAME[pieceType as PieceType]}
            >
              <span className="text-3xl drop-shadow">{PIECE_EMOJI[pieceType as PieceType]}</span>
              <span className="text-base font-bold text-amber-900">×{count}</span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
