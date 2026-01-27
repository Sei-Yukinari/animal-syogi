import { Board as BoardType, Position } from '@/types/game';
import Piece from './Piece';
import { isSamePosition } from '@/utils/pieceRules';

interface BoardProps {
  board: BoardType;
  selectedPosition: Position | null;
  validMoves: Position[];
  onSquareClick: (position: Position) => void;
}

export default function Board({
  board,
  selectedPosition,
  validMoves,
  onSquareClick,
}: BoardProps) {
  const isValidMove = (position: Position): boolean => {
    return validMoves.some((move) => isSamePosition(move, position));
  };

  const isSelected = (position: Position): boolean => {
    return selectedPosition !== null && isSamePosition(selectedPosition, position);
  };

  return (
    <div className="w-full sm:inline-block bg-gradient-to-br from-amber-100 via-orange-50 to-yellow-100 p-4 sm:p-6 rounded-2xl shadow-2xl border-4 border-amber-200">
      <div className="grid grid-rows-4 gap-1 sm:gap-1">
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-3 gap-1">
            {row.map((piece, colIndex) => {
              const position: Position = { row: rowIndex, col: colIndex };
              const selected = isSelected(position);
              const validMove = isValidMove(position);

              return (
                <button
                  key={`${rowIndex}-${colIndex}`}
                  onClick={() => onSquareClick(position)}
                  className={`
                    w-20 h-20 sm:w-36 sm:h-36
                    flex items-center justify-center
                    rounded-xl
                    transition-all duration-200
                    border-2
                    ${
                      selected
                        ? 'bg-sky-200 border-sky-400 ring-4 ring-sky-400 shadow-lg scale-105'
                        : validMove
                        ? 'bg-green-100 border-green-300 hover:bg-green-200 cursor-pointer shadow-md'
                        : 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200 hover:border-amber-300'
                    }
                    ${piece ? 'cursor-pointer' : validMove ? 'cursor-pointer' : ''}
                  `}
                >
                  {piece && <Piece piece={piece} isSelected={selected} />}
                  {validMove && !piece && (
                    <div className="w-8 h-8 bg-green-400 rounded-full opacity-60 animate-pulse"></div>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
