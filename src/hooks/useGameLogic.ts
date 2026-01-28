import { useEffect, useState } from 'react';
import { GameState, PieceType, Position, Player, Move } from '@/types/game';
import {
  applyMove,
  createInitialGameState,
  getValidDropPositions,
  getValidMovesForPiece,
  shouldPromoteChick,
  shouldAllowPromotion,
} from '@/utils/gameLogic';
import { getBestMove } from '@/utils/ai';
import { isSamePosition } from '@/utils/pieceRules';

export function useGameLogic(mode: 'standard' | 'goro' = 'standard') {
  const [gameState, setGameState] = useState<GameState>(() => createInitialGameState(false, mode));
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [showCoin, setShowCoin] = useState(false);
  const [pendingFirst, setPendingFirst] = useState<Player | null>(null);

  // 成りUI
  const [promotionPending, setPromotionPending] = useState<{
    piece: { type: PieceType; player: Player } | null;
    move: Move | null;
    resolve?: (promote: boolean) => void;
  } | null>(null);

  // コイントス結果反映
  useEffect(() => {
    if (pendingFirst) {
      // create initial state without randomness for now
      setGameState(createInitialGameState(false, mode));
      setTimeout(() => {
        setGameState({ ...createInitialGameState(false, mode), currentPlayer: pendingFirst });
        setPendingFirst(null);
      }, 500);
    }
  }, [pendingFirst, mode]);

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
          const newState = applyMove(gameState, bestMove, mode);
          setGameState(newState);
        }
        setIsAIThinking(false);
      }, 500);
    }
  }, [gameState, isAIThinking, showCoin, mode]);

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
        // 駒打ちでは即適用（将来的に二歩判定などをここで行う）
        const newState = applyMove(gameState, move, mode);
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
        const selectedPiece = gameState.board[gameState.selectedPosition.row][gameState.selectedPosition.col];
        if (selectedPiece) {
          const move = {
            from: gameState.selectedPosition,
            to: position,
            piece: selectedPiece,
          };
          // 移動後の成りが任意であれば UI で選択する必要があるが、まずは自動成りのみ適用
          // 成りが任意の場合は promotionPending を設定して UI に任せる
          const pieceForCheck = selectedPiece; 
          if (pieceForCheck && (pieceForCheck.type === 'chick' || pieceForCheck.type === 'cat')) {
            // 成れる場合はモーダルで選択
            const canPromote = (pieceForCheck.type === 'chick' && shouldPromoteChick(pieceForCheck, position, gameState.board, mode)) ||
                              (pieceForCheck.type === 'cat' && shouldAllowPromotion(pieceForCheck, position, gameState.board, mode));
            if (canPromote) {
              setPromotionPending({
                piece: pieceForCheck,
                move,
                resolve: (promote: boolean) => {
                  const newState = applyMove(gameState, move, mode, promote);
                  setGameState(newState);
                },
              });
              // ここでreturnしない: 移動自体は即時反映し、成り選択はUIで後追い
            }
          }

          const newState = applyMove(gameState, move, mode);
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
    const validMoves = getValidDropPositions(gameState.board, pieceType, 'player');
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
    promotionPending,
    setPromotionPending,
  };
}
