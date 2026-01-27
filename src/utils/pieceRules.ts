import { PieceType, Player, Position } from '@/types/game';

// 相対的な移動方向の定義
type Direction = [number, number]; // [row, col]

// 各駒の移動方向（先手視点）
const PIECE_DIRECTIONS: Record<PieceType, Direction[]> = {
  // ライオン: 全8方向
  lion: [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1],
  ],
  // キリン: 前後左右4方向
  giraffe: [
    [-1, 0],
    [0, -1], [0, 1],
    [1, 0],
  ],
  // ゾウ: 斜め4方向
  elephant: [
    [-1, -1], [-1, 1],
    [1, -1],  [1, 1],
  ],
  // ヒヨコ: 前のみ
  chick: [
    [-1, 0],
  ],
  // ニワトリ: 前、斜め前2方向、後ろの6方向
  chicken: [
    [-1, -1], [-1, 0], [-1, 1],
              [0, -1], [0, 1],
                       [1, 0],
  ],
};

/**
 * 指定された駒が移動可能な相対位置を取得
 * @param pieceType 駒の種類
 * @param player プレイヤー（後手の場合は方向を反転）
 * @returns 移動可能な相対位置の配列
 */
export function getPieceDirections(
  pieceType: PieceType,
  player: Player
): Direction[] {
  const directions = PIECE_DIRECTIONS[pieceType];

  // 後手（AI）の場合は方向を反転
  if (player === 'ai') {
    return directions.map(([row, col]) => [-row, -col] as Direction);
  }

  return directions;
}

/**
 * 座標が盤面内にあるかチェック
 * @param position チェックする座標
 * @returns 盤面内ならtrue
 */
export function isValidPosition(position: Position): boolean {
  return (
    position.row >= 0 &&
    position.row < 4 &&
    position.col >= 0 &&
    position.col < 3
  );
}

/**
 * 2つの座標が同じかチェック
 * @param pos1 座標1
 * @param pos2 座標2
 * @returns 同じ座標ならtrue
 */
export function isSamePosition(pos1: Position, pos2: Position): boolean {
  return pos1.row === pos2.row && pos1.col === pos2.col;
}
