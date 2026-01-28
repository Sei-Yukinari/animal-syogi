import { describe, it, expect } from 'vitest';
import {
  createInitialBoard,
  createInitialGameState,
  shouldPromoteChick,
  applyMove,
} from './gameLogic';
import type { Piece, Move } from '@/types/game';

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

describe('shouldPromoteChick', () => {
  it('先手ヒヨコが0段目で成る', () => {
    const piece: Piece = { type: 'chick', player: 'player' };
    expect(shouldPromoteChick(piece, { row: 0, col: 1 })).toBe(true);
    expect(shouldPromoteChick(piece, { row: 1, col: 1 })).toBe(false);
  });
  it('後手ヒヨコが3段目で成る', () => {
    const piece: Piece = { type: 'chick', player: 'ai' };
    expect(shouldPromoteChick(piece, { row: 3, col: 1 })).toBe(true);
    expect(shouldPromoteChick(piece, { row: 2, col: 1 })).toBe(false);
  });
  it('ヒヨコ以外は成らない', () => {
    const piece: Piece = { type: 'lion', player: 'player' };
    expect(shouldPromoteChick(piece, { row: 0, col: 1 })).toBe(false);
  });
});

describe('applyMove', () => {
  it('通常の駒移動ができる', () => {
    const state = createInitialGameState();
    const move: Move = { from: { row: 2, col: 1 }, to: { row: 1, col: 1 }, piece: { type: 'chick', player: 'player' } };
    const next = applyMove(state, move);
    expect(next.board[1][1]?.type).toBe('chick');
    expect(next.board[2][1]).toBe(null);
    expect(next.currentPlayer).toBe('ai');
  });
  it('ヒヨコが成るとニワトリになる', () => {
    const state = createInitialGameState();
    // 先手ヒヨコを0段目に移動
    state.board[1][1] = null;
    state.board[0][0] = { type: 'chick', player: 'player' };
    const move: Move = { from: { row: 0, col: 0 }, to: { row: 0, col: 1 }, piece: { type: 'chick', player: 'player' } };
    const next = applyMove(state, move);
    expect(next.board[0][1]?.type).toBe('chicken');
  });
  it('駒打ちができる', () => {
    const state = createInitialGameState();
    state.capturedPieces.player.push('chick');
    const move: Move = { from: null, to: { row: 1, col: 0 }, piece: { type: 'chick', player: 'player' } };
    const next = applyMove(state, move);
    expect(next.board[1][0]?.type).toBe('chick');
    expect(next.capturedPieces.player.includes('chick')).toBe(false);
  });
  it('ニワトリを取るとヒヨコとして持ち駒になる', () => {
    const state = createInitialGameState();
    state.board[1][1] = { type: 'chicken', player: 'ai' };
    const move: Move = { from: { row: 2, col: 1 }, to: { row: 1, col: 1 }, piece: { type: 'chick', player: 'player' } };
    const next = applyMove(state, move);
    expect(next.capturedPieces.player.includes('chick')).toBe(true);
  });
  it('キャッチ勝ちでwinnerが設定される', () => {
    const state = createInitialGameState();
    // aiライオンを消す
    state.board[0][1] = null;
    const move: Move = { from: { row: 2, col: 1 }, to: { row: 1, col: 1 }, piece: { type: 'chick', player: 'player' } };
    const next = applyMove(state, move);
    expect(next.winner).toBe('player');
  });
});

