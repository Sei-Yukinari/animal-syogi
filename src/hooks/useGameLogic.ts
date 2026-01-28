import { useEffect, useState } from 'react';
import { GameState, PieceType, Position, Player } from '@/types/game';
import {
  applyMove,
  createInitialGameState,
  getValidDropPositions,
  getValidMovesForPiece,
} from '@/utils/gameLogic';
// import { getBestMove } from '@/utils/ai';

import { isSamePosition } from '@/utils/pieceRules';

export function useGameLogic() {
  const [gameState, setGameState] = useState<GameState>(() => createInitialGameState(false));
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [showCoin, setShowCoin] = useState(true);
  const [pendingFirst, setPendingFirst] = useState<Player | null>(null);

  // コイントス結果反映
  useEffect(() => {
    if (pendingFirst) {
      setGameState(createInitialGameState(false));
      setTimeout(() => {
        setGameState({ ...createInitialGameState(false), currentPlayer: pendingFirst });
        setPendingFirst(null);
      }, 500);
    }
  }, [pendingFirst]);

  // AI の手番
  useEffect(() => {
    if (
      gameState.currentPlayer === 'ai' &&
      !gameState.winner &&
      !isAIThinking &&
      !showCoin
    ) {
      setIsAIThinking(true);
      setTimeout(() => {
        // Web WorkerでAI計算（public/aiWorker.js方式）
        const worker = new Worker('/aiWorker.js', { type: 'module' });
        worker.postMessage({ state: gameState, difficulty: 3 });
        worker.onmessage = (e) => {
          const bestMove = e.data;
          worker.terminate();
          if (bestMove) {
            const newState = applyMove(gameState, bestMove);
            setGameState(newState);
          }
          setIsAIThinking(false);
        };
      }, 500);
    }
  }, [gameState, isAIThinking, showCoin]);

  // マスがクリックされたとき
  const handleSquareClick = (position: Position) => {
    if (gameState.winner || gameState.currentPlayer === 'ai') return;
    if (gameState.selectedCapturedPiece) {
      const isValidDrop = gameState.validMoves.some((move) => isSamePosition(move, position));
      if (isValidDrop) {
        const move = {
          from: null,
          to: position,
          piece: {
            type: gameState.selectedCapturedPiece.pieceType,
            player: gameState.selectedCapturedPiece.player,
          },
        };
        const newState = applyMove(gameState, move);
        setGameState(newState);
      } else {
        setGameState({
          ...gameState,
          selectedCapturedPiece: null,
          validMoves: [],
        });
      }
      return;
    }
    if (gameState.selectedPosition) {
      const isValidMove = gameState.validMoves.some((move) => isSamePosition(move, position));
      if (isValidMove) {
        const piece = gameState.board[gameState.selectedPosition.row][gameState.selectedPosition.col];
        if (piece) {
          const move = {
            from: gameState.selectedPosition,
            to: position,
            piece,
          };
          const newState = applyMove(gameState, move);
          setGameState(newState);
        }
      } else {
        const clickedPiece = gameState.board[position.row][position.col];
        if (clickedPiece && clickedPiece.player === 'player') {
          const validMoves = getValidMovesForPiece(gameState.board, position);
          setGameState({
            ...gameState,
            selectedPosition: position,
            validMoves,
          });
        } else {
          setGameState({
            ...gameState,
            selectedPosition: null,
            validMoves: [],
          });
        }
      }
    } else {
      const clickedPiece = gameState.board[position.row][position.col];
      if (clickedPiece && clickedPiece.player === 'player') {
        const validMoves = getValidMovesForPiece(gameState.board, position);
        setGameState({
          ...gameState,
          selectedPosition: position,
          selectedCapturedPiece: null,
          validMoves,
        });
      }
    }
  };

  // 持ち駒がクリックされたとき
  const handleCapturedPieceClick = (pieceType: PieceType) => {
    if (gameState.currentPlayer !== 'player' || gameState.winner) return;
    const validMoves = getValidDropPositions(gameState.board);
    setGameState({
      ...gameState,
      selectedPosition: null,
      selectedCapturedPiece: { player: 'player', pieceType },
      validMoves,
    });
  };

  // ゲームをリセット
  const handleReset = () => {
    setShowCoin(true);
    setIsAIThinking(false);
  };

  return {
    gameState,
    setGameState,
    isAIThinking,
    showCoin,
    setShowCoin,
    pendingFirst,
    setPendingFirst,
    handleSquareClick,
    handleCapturedPieceClick,
    handleReset,
  };
}
