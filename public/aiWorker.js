import { getBestMove } from '/src/utils/ai';

self.onmessage = async (e) => {
  const { state, difficulty } = e.data;
  const move = getBestMove(state, difficulty);
  self.postMessage(move);
};
