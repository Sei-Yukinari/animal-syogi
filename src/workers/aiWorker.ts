import { expose } from 'comlink';
import { getBestMove } from '@/utils/ai';
import { GameState } from '@/types/game';

const api = {
  getBestMove(state: GameState, difficulty: number) {
    return getBestMove(state, difficulty);
  },
};

expose(api);
