// 駒の種類
export type PieceType =
  | 'lion'
  | 'giraffe'
  | 'elephant'
  | 'chick'
  | 'chicken'
  | 'dog'
  | 'cat'
  | 'hen'
  | 'cat_p';

// プレイヤー
export type Player = 'player' | 'ai';

// 駒の定義
export interface Piece {
  type: PieceType;
  player: Player;
}

// 盤面の座標
export interface Position {
  row: number;
  col: number;
}

// 移動の定義
export interface Move {
  from: Position | null; // nullの場合は駒打ち
  to: Position;
  piece: Piece;
}

// 盤面の状態（3列×4段）
export type Board = (Piece | null)[][];

// 持ち駒
export interface CapturedPieces {
  player: PieceType[];
  ai: PieceType[];
}

// ゲームの状態
export interface GameState {
  board: Board;
  capturedPieces: CapturedPieces;
  currentPlayer: Player;
  winner: Player | null;
  selectedPosition: Position | null;
  selectedCapturedPiece: { player: Player; pieceType: PieceType } | null;
  validMoves: Position[];
  tryPending: Player | null; // トライ待ち：どのプレイヤーのライオンが相手陣地にいるか
}

// 勝利タイプ
export type VictoryType = 'catch' | 'try';
