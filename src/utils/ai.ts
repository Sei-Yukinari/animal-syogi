import { GameState, Move, PieceType, Player } from '@/types/game';
import {
  applyMove,
  shouldPromoteChick,
  shouldAllowPromotion,
  cloneGameState,
  generateAllMoves,
} from './gameLogic';

// 駒の価値
const PIECE_VALUES: Partial<Record<PieceType, number>> = {
  lion: 10000, // ライオンは最重要
  chicken: 700, // 成った駒は価値が高い
  giraffe: 600,
  elephant: 500,
  chick: 400,
  dog: 550,
  cat: 450,
  hen: 700,
  cat_p: 700,
};

function getPieceValue(type: PieceType) {
  return PIECE_VALUES[type] ?? 100;
}

// 位置評価（中央や前線が良い）
const POSITION_BONUS = [
  [30, 40, 30], // 後手陣地（先手にとって前線）
  [20, 30, 20],
  [10, 20, 10],
  [0, 10, 0], // 先手陣地
];

/**
 * 局面を評価
 * @param state ゲーム状態
 * @param player 評価するプレイヤー
 * @returns 評価値（プレイヤーにとって有利なほど高い）
 */
function evaluatePosition(state: GameState, player: Player): number {
  const opponent: Player = player === 'player' ? 'ai' : 'player';

  // 勝敗が決まっている場合
  if (state.winner === player) return 999999;
  if (state.winner === opponent) return -999999;

  let score = 0;

  // 盤上の駒の評価
  const rows = state.board.length;
  const cols = state.board[0] ? state.board[0].length : 3;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const piece = state.board[row][col];
      if (!piece) continue;

      const pieceValue = getPieceValue(piece.type);

      // 位置ボーナス
      const positionBonus = (() => {
        if (rows === 4 && cols === 3) {
          return piece.player === 'player'
            ? POSITION_BONUS[row][col]
            : POSITION_BONUS[3 - row][col];
        }
        // simple heuristic for goro (5x6): favor center columns and forward rows
        const centerCol = Math.floor(cols / 2);
        const colBonus = Math.max(0, 30 - Math.abs(col - centerCol) * 5);
        const rowBonus = piece.player === 'player' ? (rows - 1 - row) * 5 : row * 5;
        return colBonus + rowBonus;
      })();

      const totalValue = pieceValue + positionBonus;

      if (piece.player === player) {
        score += totalValue;
      } else {
        score -= totalValue;
      }
    }
  }

  // 持ち駒の評価
  for (const pieceType of state.capturedPieces[player]) {
    score += getPieceValue(pieceType) * 0.5; // 持ち駒は少し価値を下げる
  }
  for (const pieceType of state.capturedPieces[opponent]) {
    score -= getPieceValue(pieceType) * 0.5;
  }

  return score;
}

/**
 * ミニマックス法（アルファベータ枝刈り）
 * @param state ゲーム状態
 * @param depth 探索深さ
 * @param alpha アルファ値
 * @param beta ベータ値
 * @param maximizingPlayer 最大化プレイヤーかどうか
 * @param aiPlayer AIのプレイヤー
 * @returns 評価値
 */
export function minimax(
  state: GameState,
  depth: number,
  alpha: number,
  beta: number,
  maximizingPlayer: boolean,
  aiPlayer: Player
): number {
  // 終端条件: 勝敗が決まっているか深さ0
  if (depth === 0 || state.winner !== null) {
    return evaluatePosition(state, aiPlayer);
  }

  const currentPlayer = maximizingPlayer ? aiPlayer : aiPlayer === 'player' ? 'ai' : 'player';
  const moves = generateAllMoves(state, currentPlayer);

  // 合法手がない場合（通常は起こらない）
  if (moves.length === 0) {
    return evaluatePosition(state, aiPlayer);
  }

  if (maximizingPlayer) {
    let maxEval = -Infinity;

    for (const move of moves) {
      const newState = cloneGameState(state);
      const nextState = applyMove(newState, move);

      const evalScore = minimax(nextState, depth - 1, alpha, beta, false, aiPlayer);
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);

      if (beta <= alpha) break; // ベータカット
    }

    return maxEval;
  } else {
    let minEval = Infinity;

    for (const move of moves) {
      const newState = cloneGameState(state);
      const nextState = applyMove(newState, move);

      const evalScore = minimax(nextState, depth - 1, alpha, beta, true, aiPlayer);
      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);

      if (beta <= alpha) break; // アルファカット
    }

    return minEval;
  }
}

/**
 * AIの最善手を取得
 * @param state 現在のゲーム状態
 * @param difficulty 難易度（探索深さ）
 * @returns 最善手
 */
export function getBestMove(
  state: GameState,
  difficulty: number = 3
): Move | null {
  const moves = generateAllMoves(state, 'ai');

  if (moves.length === 0) return null;

  let bestMove: Move = moves[0];
  let bestScore = -Infinity;

  for (const move of moves) {
    const newState = cloneGameState(state);
    // 成り判定: AIは自動で成る
    let promote = false;
    if ((move.piece.type === 'chick' && shouldPromoteChick(move.piece, move.to, newState.board, newState.board.length === 6 ? 'goro' : 'standard')) ||
        (move.piece.type === 'cat' && shouldAllowPromotion(move.piece, move.to, newState.board, newState.board.length === 6 ? 'goro' : 'standard'))) {
      promote = true;
    }
    const nextState = applyMove(newState, move, newState.board.length === 6 ? 'goro' : 'standard', promote);

    // ミニマックス法で評価
    const score = minimax(
      nextState,
      difficulty - 1,
      -Infinity,
      Infinity,
      false,
      'ai'
    );

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}
