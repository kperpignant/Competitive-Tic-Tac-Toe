// config/database.js
require('dotenv').config();

module.exports = {

    url : process.env.MONGO_URI, 
    dbName: 'TicTacToe'
};
