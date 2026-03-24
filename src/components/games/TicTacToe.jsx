import React, { useState } from 'react';

// ── TicTacToe Game Component ───────────────────────────────────────────────
export const TicTacToe = () => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);

  const winner = calculateWinner(board);
  const isDraw = !winner && board.every(Boolean);

  const handleClick = (i) => {
    if (board[i] || winner) return;

    const newBoard = [...board];
    newBoard[i] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    setIsXNext(!isXNext);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
  };

  return (
    <div className="flex flex-col items-center p-4 bg-surface border border-border rounded-lg">
      <h3 className="text-lg font-bold mb-4">Tic Tac Toe</h3>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {board.map((cell, i) => (
          <button
            key={i}
            className="w-16 h-16 text-2xl font-bold border border-border bg-panel hover:bg-hover rounded flex items-center justify-center transition-colors"
            onClick={() => handleClick(i)}
            disabled={!!cell || winner || isDraw}
          >
            {cell}
          </button>
        ))}
      </div>
      <div className="text-sm mb-2">
        {winner ? <span>Pemenang: {winner}</span> :
         isDraw ? <span>Seri!</span> :
         <span>Giliran: {isXNext ? 'X' : 'O'}</span>}
      </div>
      <button
        onClick={resetGame}
        className="text-xs px-3 py-1 bg-accent text-onAccent rounded hover:bg-opacity-90 transition-colors"
      >
        Reset
      </button>
    </div>
  );
};

// ── Helper: Calculate Winner ───────────────────────────────────────────────
function calculateWinner(squares) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6]             // diagonals
  ];
  for (const [a, b, c] of lines) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}
