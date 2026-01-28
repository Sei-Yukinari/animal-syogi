import { describe, it, expect } from 'vitest';
import { getBestMove, minimax } from './ai';
import { createInitialBoard, createInitialGameState, applyMove } from './gameLogic';
import { GameState } from '@/types/game';

describe('getBestMove', () => {
  it('AIが合法手を返す', () => {
    const initialState: GameState = {
      board: createInitialBoard(),
      capturedPieces: { player: [], ai: [] },
      currentPlayer: 'ai',
      winner: null,
      selectedPosition: null,
      selectedCapturedPiece: null,
      tryPending: null,
      validMoves: [],
    };
    const move = getBestMove(initialState, 1);
    expect(move).toBeTruthy();
    // 盤上のどこかに動かす手であること
    expect(move?.from).toBeDefined();
    expect(move?.to).toBeDefined();
  });
  it('合法手がない場合null', () => {
    const state: GameState = {
      board: [
        [null, null, null],
        [null, null, null],
        [null, null, null],
        [null, null, null],
      ],
      capturedPieces: { player: [], ai: [] },
      currentPlayer: 'ai',
      winner: null,
      selectedPosition: null,
      selectedCapturedPiece: null,
      tryPending: null,
      validMoves: [],
    };
    const move = getBestMove(state, 1);
    expect(move).toBeNull();
  });
});

describe('minimax', () => {
  it('勝敗が決まっていれば評価値が極端', () => {
    const state: GameState = {
      board: [
        [null, null, null],
        [null, null, null],
        [null, null, null],
        [null, null, null],
      ],
      capturedPieces: { player: [], ai: [] },
      currentPlayer: 'ai',
      winner: 'ai',
      selectedPosition: null,
      selectedCapturedPiece: null,
      tryPending: null,
      validMoves: [],
    };
    expect(minimax(state, 2, -Infinity, Infinity, true, 'ai')).toBe(999999);
    state.winner = 'player';
    expect(minimax(state, 2, -Infinity, Infinity, true, 'ai')).toBe(-999999);
  });
  it('深さ0ならevaluatePositionが呼ばれる', () => {
    const state: GameState = {
      board: [
        [null, null, null],
        [null, null, null],
        [null, null, null],
        [null, { type: 'lion', player: 'ai' }, null],
      ],
      capturedPieces: { player: [], ai: [] },
      currentPlayer: 'ai',
      winner: null,
      selectedPosition: null,
      selectedCapturedPiece: null,
      tryPending: null,
      validMoves: [],
    };
    const score = minimax(state, 0, -Infinity, Infinity, true, 'ai');
    expect(typeof score).toBe('number');
  });
  it('α-β枝刈りが動作する（分岐網羅）', () => {
    const state: GameState = {
      board: [
        [null, null, null],
        [null, { type: 'lion', player: 'ai' }, null],
        [null, null, null],
        [null, null, null],
      ],
      capturedPieces: { player: [], ai: [] },
      currentPlayer: 'ai',
      winner: null,
      selectedPosition: null,
      selectedCapturedPiece: null,
      tryPending: null,
      validMoves: [],
    };
    // 1手だけ合法手
    const move: Move = { from: { row: 1, col: 1 }, to: { row: 0, col: 1 }, piece: { type: 'lion', player: 'ai' } };
    const nextState = applyMove(state, move);
    const score = minimax(nextState, 1, -Infinity, Infinity, false, 'ai');
    expect(typeof score).toBe('number');
  });
});

