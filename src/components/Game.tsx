'use client';

import { useEffect, useState } from 'react';
import { GameState, PieceType, Position } from '@/types/game';
import {
  applyMove,
  createInitialGameState,
  getValidDropPositions,
  getValidMovesForPiece,
} from '@/utils/gameLogic';
import { getBestMove } from '@/utils/ai';
import { isSamePosition } from '@/utils/pieceRules';
import Board from './Board';
import CapturedPieces from './CapturedPieces';
import Confetti from './Confetti';
import VictoryModal from './VictoryModal';

export default function Game() {
  const [gameState, setGameState] = useState<GameState>(createInitialGameState());
  const [isAIThinking, setIsAIThinking] = useState(false);

  // AI の手番
  useEffect(() => {
    if (
      gameState.currentPlayer === 'ai' &&
      !gameState.winner &&
      !isAIThinking
    ) {
      setIsAIThinking(true);

      // 少し遅延を入れて自然な感じに
      setTimeout(() => {
        const bestMove = getBestMove(gameState, 3);
        if (bestMove) {
          const newState = applyMove(gameState, bestMove);
          setGameState(newState);
        }
        setIsAIThinking(false);
      }, 500);
    }
  }, [gameState, isAIThinking]);

  // マスがクリックされたとき
  const handleSquareClick = (position: Position) => {
    // ゲーム終了またはAIの手番なら無視
    if (gameState.winner || gameState.currentPlayer === 'ai') return;

    // 持ち駒を選択している場合
    if (gameState.selectedCapturedPiece) {
      // 有効な配置位置か確認
      const isValidDrop = gameState.validMoves.some((move) =>
        isSamePosition(move, position)
      );

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
        // 無効な位置をクリック → 選択解除
        setGameState({
          ...gameState,
          selectedCapturedPiece: null,
          validMoves: [],
        });
      }
      return;
    }

    // 駒を選択している場合
    if (gameState.selectedPosition) {
      // 有効な移動先か確認
      const isValidMove = gameState.validMoves.some((move) =>
        isSamePosition(move, position)
      );

      if (isValidMove) {
        const piece = gameState.board[gameState.selectedPosition.row][
          gameState.selectedPosition.col
        ];
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
        // 別の駒を選択
        const clickedPiece = gameState.board[position.row][position.col];
        if (clickedPiece && clickedPiece.player === 'player') {
          const validMoves = getValidMovesForPiece(gameState.board, position);
          setGameState({
            ...gameState,
            selectedPosition: position,
            validMoves,
          });
        } else {
          // 選択解除
          setGameState({
            ...gameState,
            selectedPosition: null,
            validMoves: [],
          });
        }
      }
    } else {
      // 新しく駒を選択
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
    setGameState(createInitialGameState());
    setIsAIThinking(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50 p-4 sm:p-8">
      {/* 勝利時の紙吹雪 */}
      <Confetti active={gameState.winner === 'player'} />

      {/* 勝利時のモーダル */}
      {gameState.winner && (
        <VictoryModal winner={gameState.winner} onReset={handleReset} />
      )}

      <div className="flex flex-col items-center gap-8">
        <h1 className="text-3xl sm:text-5xl font-bold text-amber-900 drop-shadow-md">
          🦁 どうぶつしょうぎ 🐘
        </h1>

        {/* 後手（AI）の持ち駒 */}
        <div
          className={`
            transition-all duration-500
            ${
              gameState.winner === 'ai'
                ? 'ring-8 ring-blue-400 rounded-3xl animate-pulse shadow-2xl'
                : ''
            }
          `}
        >
          <CapturedPieces
            pieces={gameState.capturedPieces.ai}
            player="ai"
            isCurrentPlayer={false}
            selectedPiece={null}
            onSelectPiece={() => {}}
          />
        </div>

        {/* 盤面 */}
        <div
          className={`
            transition-all duration-500
            ${gameState.winner ? 'opacity-50 pointer-events-none scale-95' : ''}
          `}
        >
          <Board
            board={gameState.board}
            selectedPosition={gameState.selectedPosition}
            validMoves={gameState.validMoves}
            onSquareClick={handleSquareClick}
          />
        </div>

        {/* 先手（プレイヤー）の持ち駒 */}
        <div
          className={`
            transition-all duration-500
            ${
              gameState.winner === 'player'
                ? 'ring-8 ring-yellow-400 rounded-3xl animate-pulse shadow-2xl'
                : ''
            }
          `}
        >
          <CapturedPieces
            pieces={gameState.capturedPieces.player}
            player="player"
            isCurrentPlayer={gameState.currentPlayer === 'player'}
            selectedPiece={
              gameState.selectedCapturedPiece?.player === 'player'
                ? gameState.selectedCapturedPiece.pieceType
                : null
            }
            onSelectPiece={handleCapturedPieceClick}
          />
        </div>

        {/* ゲーム情報 */}
        {!gameState.winner && (
          <div className="bg-gradient-to-br from-white via-yellow-50 to-orange-50 rounded-2xl shadow-lg p-4 sm:p-6 min-w-[200px] sm:min-w-[400px] text-center border-2 border-amber-200">
            {isAIThinking ? (
              <div className="text-xl text-amber-700 font-semibold animate-pulse">
                🤔 AIが考え中...
              </div>
            ) : (
              <div>
                <div className="text-2xl font-bold text-amber-900">
                  {gameState.currentPlayer === 'player'
                    ? '🙂 あなたの番です'
                    : '🤖 AIの番です'}
                </div>
                {gameState.tryPending && (
                  <div className="mt-3 text-base text-orange-600 font-bold bg-orange-50 border-2 border-orange-300 rounded-lg p-3 animate-pulse">
                    ⚠️ {gameState.tryPending === 'player' ? 'あなた' : 'AI'}
                    のライオンが相手陣地に！
                    <br />
                    次のターンまで取られなければトライ勝ち
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* リセットボタン */}
        {!gameState.winner && (
          <button
            onClick={handleReset}
            className="px-6 py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold rounded-xl hover:from-amber-500 hover:to-orange-600 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 border-2 border-amber-300"
          >
            🔄 ゲームをリセット
          </button>
        )}
      </div>
    </div>
  );
}
