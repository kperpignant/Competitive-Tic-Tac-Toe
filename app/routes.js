const Game = require('./models/game');
const gameLogic = require('./models/gamelogic.js');

//-------CLAUDE AI Helped-------
//------------------------------
module.exports = function(app, passport, db) {

// normal routes ===============================================================

    app.get('/', function(req, res) {
        res.render('index.ejs');
    });

    // PROFILE/GAME LOBBY =========================
    app.get('/profile', isLoggedIn, function(req, res) {
        Game.find({
            $or: [
                { status: 'waiting' },
                { 'playerX.id': req.user._id },
                { 'playerO.id': req.user._id }
            ]
        }).sort({ lastMove: -1 }).exec((err, games) => {
            if (err) return console.log(err);
            
            // Separate games into categories
            const myGames = games.filter(g => 
                (g.playerX.id === req.user._id.toString() || 
                 g.playerO.id === req.user._id.toString()) &&
                g.status !== 'waiting'
            );
            const availableGames = games.filter(g => 
                g.status === 'waiting' && 
                g.playerX.id !== req.user._id.toString()
            );

            res.render('profile.ejs', {
                user: req.user,
                myGames: myGames,
                availableGames: availableGames
            });
        });
    });

    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout(() => {
            console.log('User has logged out!');
        });
        res.redirect('/');
    });

// TIC-TAC-TOE GAME ROUTES ===============================================================

    // CREATE NEW GAME
app.post('/game/create', isLoggedIn, async (req, res) => {
    try {
        const newGame = new Game({
            playerX: {
                id: req.user._id,
                email: req.user.local.email
            }
        });

        const savedGame = await newGame.save();
        console.log('New game created:', savedGame._id);
        res.redirect('/game/' + savedGame._id);
    } catch (err) {
        console.error('Error creating game:', err);
        res.redirect('/profile');
    }
});

    // VIEW SPECIFIC GAME
app.get('/game/:id', isLoggedIn, async (req, res) => {
    try {
        const game = await Game.findById(req.params.id);
        if (!game) return res.redirect('/profile');

        // Check if user is part of this game
        const isPlayerX = game.playerX.id === req.user._id.toString();
        const isPlayerO = game.playerO && game.playerO.id === req.user._id.toString();
        
        if (!isPlayerX && !isPlayerO && game.status !== 'waiting') {
            return res.redirect('/profile');
        }

        res.render('game.ejs', {
            user: req.user,
            game: game,
            isPlayerX: isPlayerX,
            isPlayerO: isPlayerO
        });
    } catch (err) {
        console.error('Error loading game:', err);
        res.redirect('/profile');
    }
});

    // JOIN GAME
    app.post('/game/join/:id', isLoggedIn, (req, res) => {
        Game.findById(req.params.id, (err, game) => {
            if (err) return res.send(err);
            if (!game) return res.send({ error: 'Game not found' });
            if (game.status !== 'waiting') return res.send({ error: 'Game already started' });
            if (game.playerX.id === req.user._id.toString()) {
                return res.send({ error: 'Cannot join your own game' });
            }

            game.playerO = {
                id: req.user._id,
                email: req.user.local.email
            };
            game.status = 'active';

            game.save((err) => {
                if (err) return res.send(err);
                res.send({ success: true, gameId: game._id });
            });
        });
    });

    // MAKE A MOVE
    app.put('/game/move/:id', isLoggedIn, async (req, res) => {
    try {
        const position = req.body.position;
        const game = await Game.findById(req.params.id);
        
        if (!game) return res.send({ error: 'Game not found' });
        if (game.status !== 'active') return res.send({ error: 'Game is not active' });

        // Check if it's the player's turn
        const isPlayerX = game.playerX.id === req.user._id.toString();
        const isPlayerO = game.playerO.id === req.user._id.toString();
        
        if ((game.currentTurn === 'X' && !isPlayerX) || 
            (game.currentTurn === 'O' && !isPlayerO)) {
            return res.send({ error: 'Not your turn' });
        }

        // Validate move
        if (!gameLogic.isValidMove(game.board, position)) {
            return res.send({ error: 'Invalid move' });
        }

        // Make the move - IMPORTANT: Mark array as modified for Mongoose
        game.board[position] = game.currentTurn;
        game.markModified('board'); // This tells Mongoose the array changed
        game.lastMove = new Date();

        // Check for winner
        const result = gameLogic.checkWinner(game.board);
        if (result) {
            game.status = 'finished';
            game.winner = result;
        } else {
            // Switch turns
            game.currentTurn = game.currentTurn === 'X' ? 'O' : 'X';
        }

        await game.save();
        console.log('Game saved successfully:', game.board);
        
        res.send({ 
            success: true, 
            game: game 
        });
    } catch (err) {
        console.error('Error saving move:', err);
        res.send({ error: 'Error saving move' });
    }
});

    // DELETE/CANCEL GAME
    app.delete('/game/:id', isLoggedIn, (req, res) => {
        Game.findById(req.params.id, (err, game) => {
            if (err) return res.send(err);
            if (!game) return res.send({ error: 'Game not found' });
            
            // Only allow deletion if you're playerX and game is waiting
            if (game.playerX.id !== req.user._id.toString() || game.status !== 'waiting') {
                return res.send({ error: 'Cannot delete this game' });
            }

            Game.findByIdAndDelete(req.params.id, (err) => {
                if (err) return res.send(err);
                res.send({ success: true });
            });
        });
    });

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

    // LOGIN ===============================
    app.get('/login', function(req, res) {
        res.render('login.ejs', { message: req.flash('loginMessage') });
    });

    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/profile',
        failureRedirect: '/login',
        failureFlash: true
    }));

    // SIGNUP =================================
    app.get('/signup', function(req, res) {
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/profile',
        failureRedirect: '/signup',
        failureFlash: true
    }));

// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================

    app.get('/unlink/local', isLoggedIn, function(req, res) {
        var user = req.user;
        user.local.email = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/');
}