import { useEffect, useState, useRef } from 'react';
import { GameState, PieceType, Position, Player } from '@/types/game';
import {
  applyMove,
  createInitialGameState,
  getValidDropPositions,
  getValidMovesForPiece,
} from '@/utils/gameLogic';
import { getBestMove } from '@/utils/ai';

import { isSamePosition } from '@/utils/pieceRules';

import { UseGameLogicApi } from '@/types/useGameLogicApi';

export function useGameLogic(): UseGameLogicApi {
  const [gameState, setGameState] = useState<GameState>(() => createInitialGameState(false));
  const gameStateRef = useRef(gameState);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [showCoin, setShowCoin] = useState(true);
  const [pendingFirst, setPendingFirst] = useState<Player | null>(null);

  // keep ref in sync
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);

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
        const bestMove = getBestMove(gameState, 3);
        if (bestMove) {
          const newState = applyMove(gameState, bestMove);
          setGameState(newState);
        }
        setIsAIThinking(false);
      }, 500);
    }
  }, [gameState, isAIThinking, showCoin]);

  // マスがクリックされたとき
  const handleSquareClick = (position: Position) => {
    setGameState((prev) => {
      if (prev.winner || prev.currentPlayer === 'ai') return prev;
      if (prev.selectedCapturedPiece) {
        const isValidDrop = prev.validMoves.some((move) => isSamePosition(move, position));
        if (isValidDrop) {
          const move = {
            from: null,
            to: position,
            piece: {
              type: prev.selectedCapturedPiece.pieceType,
              player: prev.selectedCapturedPiece.player,
            },
          };
          return applyMove(prev, move);
        }
        return {
          ...prev,
          selectedCapturedPiece: null,
          validMoves: [],
        };
      }
      if (prev.selectedPosition) {
        const isValidMove = prev.validMoves.some((move) => isSamePosition(move, position));
        if (isValidMove) {
          const piece = prev.board[prev.selectedPosition.row][prev.selectedPosition.col];
          if (piece) {
            const move = {
              from: prev.selectedPosition,
              to: position,
              piece,
            };
            return applyMove(prev, move);
          }
          return prev;
        } else {
          const clickedPiece = prev.board[position.row][position.col];
          if (clickedPiece && clickedPiece.player === 'player') {
            const validMoves = getValidMovesForPiece(prev.board, position);
            return {
              ...prev,
              selectedPosition: position,
              validMoves,
            };
          }
          return {
            ...prev,
            selectedPosition: null,
            validMoves: [],
          };
        }
      } else {
        const clickedPiece = prev.board[position.row][position.col];
        if (clickedPiece && clickedPiece.player === 'player') {
          const validMoves = getValidMovesForPiece(prev.board, position);
          return {
            ...prev,
            selectedPosition: position,
            selectedCapturedPiece: null,
            validMoves,
          };
        }
        return prev;
      }
    });
  };

  // 持ち駒がクリックされたとき
  const handleCapturedPieceClick = (pieceType: PieceType) => {
    setGameState((prev) => {
      if (prev.currentPlayer !== 'player' || prev.winner) return prev;
      const validMoves = getValidDropPositions(prev.board);
      return {
        ...prev,
        selectedPosition: null,
        selectedCapturedPiece: { player: 'player', pieceType },
        validMoves,
      };
    });
  };

  // ゲームをリセット
  const handleReset = () => {
    setShowCoin(true);
    setIsAIThinking(false);
    setGameState(createInitialGameState(false));
  };

  // Return stable functions and values so tests can capture them synchronously
  // Expose a getter for synchronous tests to read latest state
  const getState = () => gameStateRef.current;

  // Expose gameState as a getter property to always reflect latest state when captured by tests
  const api: UseGameLogicApi = {
    getState,
    setGameState,
    isAIThinking,
    showCoin,
    setShowCoin,
    pendingFirst,
    setPendingFirst,
    handleSquareClick: (pos: Position) => handleSquareClick(pos),
    handleCapturedPieceClick: (pt: PieceType) => handleCapturedPieceClick(pt),
    handleReset: () => handleReset(),
  };
  Object.defineProperty(api, 'gameState', {
    get: () => getState(),
  });

  return api;
}
