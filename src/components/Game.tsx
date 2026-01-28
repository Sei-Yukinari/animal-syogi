'use client';

import { useState } from 'react';
// import { PieceType, Position, Player } from '@/types/game';
import CoinFlip from './CoinFlip';
import { useGameLogic } from '@/hooks/useGameLogic';
import Board from './Board';
import CapturedPieces from './CapturedPieces';
import Confetti from './Confetti';
import VictoryModal from './VictoryModal';

export default function Game() {
  const [mode, setMode] = useState<'standard' | 'goro' | null>(null);

  const {
    gameState,

    isAIThinking,
    showCoin,
    setShowCoin,

    setPendingFirst,
    handleSquareClick,
    handleCapturedPieceClick,
    handleReset,
  } = useGameLogic(mode);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50 p-4 sm:p-8">
      {showCoin && (
        <CoinFlip onResult={(result) => {
          setPendingFirst(result);
          setTimeout(() => setShowCoin(false), 100);
        }} />
      )}
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

        {!mode && (
          <div className="flex gap-4">
            <button
              onClick={() => {
                setMode('standard');
                setShowCoin(true);
              }}
              className="px-4 py-2 bg-amber-400 text-white rounded-lg font-bold"
            >
              どうぶつしょうぎ
            </button>
            <button
              onClick={() => {
                setMode('goro');
                setShowCoin(true);
              }}
              className="px-4 py-2 bg-amber-200 text-amber-900 rounded-lg font-bold"
            >
              ごろごろどうぶつしょうぎ
            </button>
          </div>
        )}

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
