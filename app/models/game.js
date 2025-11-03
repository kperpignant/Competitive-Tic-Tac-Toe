// app/models/game.js
var mongoose = require('mongoose');

//-------CLAUDE AI Helped-------
//------------------------------
var gameSchema = mongoose.Schema({
    playerX: {
        id: String,
        email: String
    },
    playerO: {
        id: String,
        email: String
    },
    board: {
        type: [String],
        default: ['', '', '', '', '', '', '', '', '']
    },
    currentTurn: {
        type: String,
        enum: ['X', 'O'],
        default: 'X'
    },
    status: {
        type: String,
        enum: ['waiting', 'active', 'finished'],
        default: 'waiting'
    },
    winner: {
        type: String,
        enum: ['X', 'O', 'draw', null],
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastMove: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Game', gameSchema);