import { GameState, PieceType, Player, Position } from '@/types/game';

export interface UseGameLogicApi {
  getState: () => GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  isAIThinking: boolean;
  showCoin: boolean;
  setShowCoin: React.Dispatch<React.SetStateAction<boolean>>;
  pendingFirst: Player | null;
  setPendingFirst: React.Dispatch<React.SetStateAction<Player | null>>;
  handleSquareClick: (pos: Position) => void;
  handleCapturedPieceClick: (pt: PieceType) => void;
  handleReset: () => void;
  readonly gameState: GameState;
}
