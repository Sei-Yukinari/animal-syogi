import { describe, it, expect } from 'vitest';
import { getBestMove } from './ai';
import { createInitialBoard } from './gameLogic';
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
});
