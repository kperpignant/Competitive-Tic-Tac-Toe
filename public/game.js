// public/game.js

//-------CLAUDE AI Helped-------
//------------------------------

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing game...');
    console.log('Game data on load:', gameData);

    const cells = document.querySelectorAll('.game-cell');
    const deleteButton = document.querySelector('.delete-game');

    console.log('Found cells:', cells.length);

    // Handle cell clicks (making moves)
    cells.forEach(cell => {
        cell.addEventListener('click', function() {
            console.log('Cell clicked!');
            console.log('Game status:', gameData.status);
            console.log('Cell classes:', this.className);
            
            // Don't allow moves if game is not active
            if (gameData.status === 'waiting') {
                console.log('Setting up auto-refresh for waiting game');
                setInterval(() => {
                    window.location.reload();
                }, 5000);
            }

            // Don't allow moves if cell is already taken
            if (this.classList.contains('taken')) {
                console.log('Cell is already taken');
                return;
            }

            // Auto-refresh for active games when it's opponent's turn (check every 3 seconds)
if (gameData.status === 'active') {
    const isMyTurn = (gameData.currentTurn === 'X' && gameData.isPlayerX) || 
                     (gameData.currentTurn === 'O' && gameData.isPlayerO);
    
    console.log('Game is active. Is my turn?', isMyTurn);
    
    if (!isMyTurn) {
        console.log('Setting up auto-refresh for opponent turn');
        setInterval(() => {
            console.log('Auto-refreshing...');
            window.location.reload();
        }, 3000);
    }
}

            // Check if it's the player's turn
            const isMyTurn = (gameData.currentTurn === 'X' && gameData.isPlayerX) || 
                             (gameData.currentTurn === 'O' && gameData.isPlayerO);
            
            console.log('Is my turn?', isMyTurn);
            console.log('Current turn:', gameData.currentTurn);
            console.log('Am I player X?', gameData.isPlayerX);
            console.log('Am I player O?', gameData.isPlayerO);
            
            if (!isMyTurn) {
                alert("It's not your turn!");
                return;
            }

            const position = parseInt(this.dataset.position);
            console.log('Making move at position:', position);

            // Make the move
            makeMove(position);
        });
    });

    function makeMove(position) {
    console.log('Sending move request...');
    
    fetch(`/game/move/${gameData.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            position: position
        })
    })
    .then(response => {
        console.log('Response received:', response);
        return response.json();
    })
    .then(data => {
        console.log('Response data:', data);
        if (data.success) {
            console.log('Move successful!');
            console.log('Game state after move:', data.game);
            // TEMPORARILY DISABLED - Reload the page to show updated game state
            window.location.reload();
        } else {
            console.log('Move failed:', data.error);
            alert(data.error || 'Invalid move');
        }
    })
    .catch(err => {
        console.error('Error making move:', err);
        alert('Error making move. Please try again.');
    });
}

    // Handle game deletion (cancel waiting game)
    if (deleteButton) {
        deleteButton.addEventListener('click', function() {
            const gameId = this.dataset.gameId;
            
            if (!confirm('Are you sure you want to cancel this game?')) {
                return;
            }
            
            fetch(`/game/${gameId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    window.location.href = '/profile';
                } else {
                    alert(data.error || 'Failed to cancel game');
                }
            })
            .catch(err => {
                console.error('Error canceling game:', err);
                alert('Error canceling game. Please try again.');
            });
        });
    }
});