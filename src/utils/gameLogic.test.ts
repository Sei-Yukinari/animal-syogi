import { describe, it, expect } from 'vitest';
import { createInitialBoard } from './gameLogic';

// 初期盤面のテスト

describe('createInitialBoard', () => {
  it('初期盤面が正しい', () => {
    const board = createInitialBoard();
    expect(board).toHaveLength(4);
    expect(board[0][0]?.type).toBe('elephant');
    expect(board[0][1]?.type).toBe('lion');
    expect(board[0][2]?.type).toBe('giraffe');
    expect(board[1][1]?.type).toBe('chick');
    expect(board[2][1]?.type).toBe('chick');
    expect(board[3][0]?.type).toBe('giraffe');
    expect(board[3][1]?.type).toBe('lion');
    expect(board[3][2]?.type).toBe('elephant');
  });
});
