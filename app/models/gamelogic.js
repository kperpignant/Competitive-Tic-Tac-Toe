// app/gameLogic.js

function checkWinner(board) {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6]             // diagonals
    ];

    for (let pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a]; // Returns 'X' or 'O'
        }
    }

    // Check for draw
    if (board.every(cell => cell !== '')) {
        return 'draw';
    }

    return null; // Game still in progress
}

function isValidMove(board, position) {
    return position >= 0 && position <= 8 && board[position] === '';
}

//-------CLAUDE AI Helped-------
//------------------------------

module.exports = {
    checkWinner,
    isValidMove
};