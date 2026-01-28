import { render, act } from '@testing-library/react';
import { useGameLogic } from './useGameLogic';
import React from 'react';

import { UseGameLogicApi } from '@/types/useGameLogicApi';

function TestComponent({ onTest }: { onTest: (logic: UseGameLogicApi) => void }) {
  const logic = useGameLogic();
  React.useEffect(() => {
    onTest(logic);
  }, []);
  return null;
}

describe('useGameLogic', () => {
  it('初期状態はコイントス待ち', () => {
    let logic: UseGameLogicApi;
    render(<TestComponent onTest={l => { logic = l; }} />);
    expect(logic.showCoin).toBe(true);
    expect(logic.gameState.currentPlayer).toBe('player');
  });

  it('コイントス後に先手が切り替わる', async () => {
    let logic: UseGameLogicApi;
    render(<TestComponent onTest={l => { logic = l; }} />);
    act(() => {
      logic.setPendingFirst('ai');
    });
    // 600ms待つ（useEffect+setTimeout 500ms）
    await new Promise(res => setTimeout(res, 600));
    expect(logic.gameState.currentPlayer).toBe('ai');
  });

  it('駒選択→移動で状態が更新される', () => {
    let logic: UseGameLogicApi;
    render(<TestComponent onTest={l => { logic = l; }} />);
    act(() => {
      logic.handleSquareClick({ row: 2, col: 1 });
    });
    expect(logic.gameState.selectedPosition).toEqual({ row: 2, col: 1 });
    const to = { row: 1, col: 1 };
    act(() => {
      logic.handleSquareClick(to);
    });
    expect(logic.gameState.board[1][1]?.type).toBe('chick');
    expect(logic.gameState.selectedPosition).toBe(null);
  });

  it('持ち駒打ちで盤面が更新される', () => {
    let logic: UseGameLogicApi;
    render(<TestComponent onTest={l => { logic = l; }} />);
    act(() => {
      logic.gameState.capturedPieces.player.push('chick');
      logic.handleCapturedPieceClick('chick');
    });
    act(() => {
      logic.handleSquareClick({ row: 1, col: 0 });
    });
    expect(logic.gameState.board[1][0]?.type).toBe('chick');
  });

  it('リセットで初期化される', () => {
    let logic: UseGameLogicApi;
    render(<TestComponent onTest={l => { logic = l; }} />);
    act(() => {
      logic.handleReset();
    });
    expect(logic.gameState.board[0][1]?.type).toBe('lion');
    expect(logic.gameState.capturedPieces.player.length).toBe(0);
  });
});
