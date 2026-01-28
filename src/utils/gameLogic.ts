import {
  Board,
  CapturedPieces,
  GameState,
  Move,
  Piece,
  Player,
  Position,
} from '@/types/game';
import {
  getPieceDirections,
  isValidPosition,
} from './pieceRules';

/**
 * 初期盤面を作成
 * 配置:
 * Row 0 (後手): ゾウ/ライオン/キリン
 * Row 1 (後手): 空/ヒヨコ/空
 * Row 2 (先手): 空/ヒヨコ/空
 * Row 3 (先手): キリン/ライオン/ゾウ
 */
export function createInitialBoard(mode: 'standard' | 'goro' = 'standard'): Board {
  if (mode === 'standard') {
    const board: Board = [
      [
        { type: 'elephant', player: 'ai' },
        { type: 'lion', player: 'ai' },
        { type: 'giraffe', player: 'ai' },
      ],
      [null, { type: 'chick', player: 'ai' }, null],
      [null, { type: 'chick', player: 'player' }, null],
      [
        { type: 'giraffe', player: 'player' },
        { type: 'lion', player: 'player' },
        { type: 'elephant', player: 'player' },
      ],
    ];
    return board;
  }

  // goro mode: 5 cols x 6 rows (rows 0..5)
  const board: Board = [
    // y=0 (後手側): C D L D C
    [
      { type: 'cat', player: 'ai' },
      { type: 'dog', player: 'ai' },
      { type: 'lion', player: 'ai' },
      { type: 'dog', player: 'ai' },
      { type: 'cat', player: 'ai' },
    ],
    // y=1: empty
    [null, null, null, null, null],
    // y=2: H H H (後手側ひよこ)
    [null, { type: 'chick', player: 'ai' }, { type: 'chick', player: 'ai' }, { type: 'chick', player: 'ai' }, null],
    // y=3: H H H (先手側ひよこ)
    [null, { type: 'chick', player: 'player' }, { type: 'chick', player: 'player' }, { type: 'chick', player: 'player' }, null],
    // y=4: empty
    [null, null, null, null, null],
    // y=5 (先手側): C D L D C
    [
      { type: 'cat', player: 'player' },
      { type: 'dog', player: 'player' },
      { type: 'lion', player: 'player' },
      { type: 'dog', player: 'player' },
      { type: 'cat', player: 'player' },
    ],
  ];

  return board;
}

/**
 * 初期ゲーム状態を作成
 */
export function createInitialGameState(
  randomFirst: boolean = false,
  mode: 'standard' | 'goro' = 'standard'
): GameState {
  const first: Player = randomFirst
    ? (Math.random() < 0.5 ? 'player' : 'ai')
    : 'player';
  return {
    board: createInitialBoard(mode),
    capturedPieces: { player: [], ai: [] },
    currentPlayer: first,
    winner: null,
    selectedPosition: null,
    selectedCapturedPiece: null,
    validMoves: [],
    tryPending: null,
  };
}

/**
 * 指定位置の駒が移動可能な位置のリストを取得
 * @param board 盤面
 * @param from 駒の現在位置
 * @returns 移動可能な位置の配列
 */
export function getValidMovesForPiece(
  board: Board,
  from: Position
): Position[] {
  const piece = board[from.row][from.col];
  if (!piece) return [];

  const directions = getPieceDirections(piece.type, piece.player);
  const validMoves: Position[] = [];

  for (const [dRow, dCol] of directions) {
    const to: Position = {
      row: from.row + dRow,
      col: from.col + dCol,
    };

    // 盤面外なら無効
    if (!isValidPosition(to, board)) continue;

    const targetPiece = board[to.row][to.col];

    // 空きマスまたは相手の駒なら移動可能
    if (!targetPiece || targetPiece.player !== piece.player) {
      validMoves.push(to);
    }
  }

  return validMoves;
}

/**
 * 持ち駒を打てる位置のリストを取得
 * @param board 盤面
 * @returns 駒を打てる位置の配列
 */
export function getValidDropPositions(board: Board): Position[] {
  const validPositions: Position[] = [];

  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < (board[0] ? board[0].length : 0); col++) {
      if (board[row][col] === null) {
        validPositions.push({ row, col });
      }
    }
  }

  return validPositions;
}

/**
 * ヒヨコが成る位置にいるかチェック
 * @param piece 駒
 * @param position 位置
 * @returns 成るべきならtrue
 */
export function shouldPromoteChick(piece: Piece, position: Position): boolean {
  if (piece.type !== 'chick') return false;

  // 先手は0段目（後手陣地）、後手は3段目（先手陣地）で成る
  if (piece.player === 'player' && position.row === 0) return true;
  if (piece.player === 'ai' && position.row === 3) return true;

  return false;
}

/**
 * 駒を移動
 * @param state 現在のゲーム状態
 * @param move 移動
 * @returns 新しいゲーム状態
 */
export function applyMove(state: GameState, move: Move): GameState {
  const newBoard = state.board.map((row) => [...row]);
  const newCapturedPieces: CapturedPieces = {
    player: [...state.capturedPieces.player],
    ai: [...state.capturedPieces.ai],
  };

  // 駒打ちの場合
  if (move.from === null) {
    newBoard[move.to.row][move.to.col] = move.piece;

    // 持ち駒から削除
    const capturedList = newCapturedPieces[move.piece.player];
    const index = capturedList.indexOf(move.piece.type);
    if (index > -1) {
      capturedList.splice(index, 1);
    }
  } else {
    // 通常の移動
    const targetPiece = newBoard[move.to.row][move.to.col];

    // 駒を取る場合
    if (targetPiece) {
      // ニワトリはヒヨコに戻す
      const capturedType =
        targetPiece.type === 'chicken' ? 'chick' : targetPiece.type;
      newCapturedPieces[move.piece.player].push(capturedType);
    }

    // 駒を移動
    newBoard[move.to.row][move.to.col] = move.piece;
    newBoard[move.from.row][move.from.col] = null;

    // ヒヨコの成り判定
    if (shouldPromoteChick(move.piece, move.to)) {
      newBoard[move.to.row][move.to.col] = {
        ...move.piece,
        type: 'chicken',
      };
    }
  }

  // 手番を交代
  const nextPlayer: Player = state.currentPlayer === 'player' ? 'ai' : 'player';

  // キャッチ勝ちの判定
  let winner = checkWinner(newBoard);

  // トライ勝ちの判定：前のターンでトライ待ちだった場合
  if (!winner && state.tryPending) {
    // トライ待ちのプレイヤーのライオンがまだ相手陣地にいればトライ勝ち
    if (checkLionInEnemyTerritory(newBoard, state.tryPending)) {
      winner = state.tryPending;
    }
  }

  // 新しいトライ待ち状態を設定
  let newTryPending: Player | null = null;
  if (!winner) {
    // 今移動したプレイヤーのライオンが相手陣地に到達したかチェック
    if (checkLionInEnemyTerritory(newBoard, state.currentPlayer)) {
      newTryPending = state.currentPlayer;
    }
  }

  return {
    board: newBoard,
    capturedPieces: newCapturedPieces,
    currentPlayer: winner ? state.currentPlayer : nextPlayer,
    winner,
    selectedPosition: null,
    selectedCapturedPiece: null,
    validMoves: [],
    tryPending: newTryPending,
  };
}

/**
 * 勝者を判定（キャッチ勝ちのみ）
 * @param board 盤面
 * @returns 勝者（いない場合はnull）
 */
export function checkWinner(board: Board): Player | null {
  let playerLionExists = false;
  let aiLionExists = false;

  // ライオンの存在を確認
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < (board[0] ? board[0].length : 0); col++) {
      const piece = board[row][col];
      if (piece && piece.type === 'lion') {
        if (piece.player === 'player') {
          playerLionExists = true;
        } else {
          aiLionExists = true;
        }
      }
    }
  }

  // キャッチ勝ち: 相手のライオンがいない
  if (!aiLionExists) return 'player';
  if (!playerLionExists) return 'ai';

  return null;
}

/**
 * ライオンが相手陣地にいるかチェック
 * @param board 盤面
 * @param player チェックするプレイヤー
 * @returns 相手陣地にいればtrue
 */
export function checkLionInEnemyTerritory(
  board: Board,
  player: Player
): boolean {
  const targetRow = player === 'player' ? 0 : board.length - 1;

  for (let col = 0; col < (board[0] ? board[0].length : 0); col++) {
    const piece = board[targetRow][col];
    if (piece && piece.type === 'lion' && piece.player === player) {
      return true;
    }
  }

  return false;
}

/**
 * 全ての合法手を生成
 * @param state ゲーム状態
 * @param player プレイヤー
 * @returns 合法手の配列
 */
export function generateAllMoves(state: GameState, player: Player): Move[] {
  const moves: Move[] = [];

  // 盤上の駒の移動
  for (let row = 0; row < state.board.length; row++) {
    for (let col = 0; col < (state.board[0] ? state.board[0].length : 0); col++) {
      const piece = state.board[row][col];
      if (piece && piece.player === player) {
        const from: Position = { row, col };
        const validMoves = getValidMovesForPiece(state.board, from);

        for (const to of validMoves) {
          moves.push({ from, to, piece });
        }
      }
    }
  }

  // 持ち駒を打つ
  const capturedPieces = state.capturedPieces[player];
  if (capturedPieces.length > 0) {
    const dropPositions = getValidDropPositions(state.board);

    for (const pieceType of capturedPieces) {
      for (const to of dropPositions) {
        moves.push({
          from: null,
          to,
          piece: { type: pieceType, player },
        });
      }
    }
  }

  return moves;
}

/**
 * 盤面をコピー
 */
export function cloneBoard(board: Board): Board {
  return board.map((row) => row.map((piece) => (piece ? { ...piece } : null)));
}

/**
 * ゲーム状態をコピー
 */
export function cloneGameState(state: GameState): GameState {
  return {
    board: cloneBoard(state.board),
    capturedPieces: {
      player: [...state.capturedPieces.player],
      ai: [...state.capturedPieces.ai],
    },
    currentPlayer: state.currentPlayer,
    winner: state.winner,
    selectedPosition: state.selectedPosition
      ? { ...state.selectedPosition }
      : null,
    selectedCapturedPiece: state.selectedCapturedPiece
      ? { ...state.selectedCapturedPiece }
      : null,
    validMoves: state.validMoves.map((pos) => ({ ...pos })),
    tryPending: state.tryPending,
  };
}
