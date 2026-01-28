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

// const PIECE_IMAGE: Partial<Record<PieceType['type'], string>> = {
//   lion: '/images/pieces/lion.png',
//   // 他の駒画像は今後追加可能
// };


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
    [true, false, true],
    [false, true, false],
  ],
};

const PIECE_BG: Record<PieceType['type'], string> = {
  lion: 'bg-pink-100',      // ライオン: 薄いピンク
  chick: 'bg-lime-100',     // ヒヨコ: 薄い黄緑
  giraffe: 'bg-violet-200', // キリン: 紫
  elephant: 'bg-purple-100',// ゾウ: 薄い紫
  chicken: 'bg-yellow-100', // ニワトリ: 薄い黄色（未指定の補完）
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
                  <div className={`${PIECE_BG[piece.type]} rounded-lg p-1 sm:p-2 flex items-center justify-center`}>
                    <div className="text-3xl sm:text-6xl select-none drop-shadow-md">{PIECE_EMOJI[piece.type]}</div>
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
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full drop-shadow"></div>
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
