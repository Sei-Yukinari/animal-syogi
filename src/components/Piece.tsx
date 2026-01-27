import { Piece as PieceType } from '@/types/game';

interface PieceProps {
  piece: PieceType;
  isSelected?: boolean;
}

// 駒の絵文字マッピング
const PIECE_EMOJI: Record<PieceType['type'], string> = {
  lion: '🦁',
  giraffe: '🦒',
  elephant: '🐘',
  chick: '🐤',
  chicken: '🐔',
};

// 駒の日本語名
const PIECE_NAME: Record<PieceType['type'], string> = {
  lion: 'ライオン',
  giraffe: 'キリン',
  elephant: 'ゾウ',
  chick: 'ヒヨコ',
  chicken: 'ニワトリ',
};

// 各駒の動ける方向（3×3グリッド、中央が駒の位置）
// true = 動ける方向
type DirectionGrid = boolean[][];

const PIECE_DIRECTIONS: Record<PieceType['type'], DirectionGrid> = {
  // ライオン: 全8方向
  lion: [
    [true, true, true],
    [true, false, true],
    [true, true, true],
  ],
  // キリン: 前後左右4方向
  giraffe: [
    [false, true, false],
    [true, false, true],
    [false, true, false],
  ],
  // ゾウ: 斜め4方向
  elephant: [
    [true, false, true],
    [false, false, false],
    [true, false, true],
  ],
  // ヒヨコ: 前のみ
  chick: [
    [false, true, false],
    [false, false, false],
    [false, false, false],
  ],
  // ニワトリ: 前、斜め前2方向、後ろの6方向
  chicken: [
    [true, true, true],
    [false, false, false],
    [true, true, true],
  ],
};

export default function Piece({ piece, isSelected = false }: PieceProps) {
  const isAI = piece.player === 'ai';
  const directions = PIECE_DIRECTIONS[piece.type];

  return (
    <div
      className={`
        w-full h-full
        transition-all duration-200
        ${isSelected ? 'scale-110 drop-shadow-lg' : ''}
        ${isAI ? 'rotate-180' : ''}
      `}
      title={PIECE_NAME[piece.type]}
    >
      {/* 3×3グリッドで駒と矢印を配置 */}
      <div className="grid grid-cols-3 grid-rows-3 w-full h-full gap-0">
        {directions.map((row, rowIndex) =>
          row.map((canMove, colIndex) => {
            // 中央（1, 1）は駒を表示
            if (rowIndex === 1 && colIndex === 1) {
              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className="flex items-center justify-center"
                >
                  <div className="text-6xl select-none drop-shadow-md">
                    {PIECE_EMOJI[piece.type]}
                  </div>
                </div>
              );
            }

            // 動ける方向なら丸を表示
            if (canMove) {
              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className="flex items-center justify-center"
                >
                  <div className="w-3 h-3 bg-red-500 rounded-full drop-shadow"></div>
                </div>
              );
            }

            // 動けない方向は空白
            return <div key={`${rowIndex}-${colIndex}`} />;
          })
        )}
      </div>
    </div>
  );
}
