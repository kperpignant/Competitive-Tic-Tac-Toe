// public/lobby.js

// Handle joining a game
const joinButtons = document.querySelectorAll('.join-game');

joinButtons.forEach(button => {
    button.addEventListener('click', function() {
        const gameId = this.dataset.gameId;
        
        fetch(`/game/join/${gameId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Redirect to the game page
                window.location.href = `/game/${data.gameId}`;
            } else {
                alert(data.error || 'Failed to join game');
            }
        })
        .catch(err => {
            console.error('Error joining game:', err);
            alert('Error joining game. Please try again.');
        });
    });
});
//-------CLAUDE AI Helped-------
//------------------------------

// Handle deleting a game (if implemented)
const deleteButtons = document.querySelectorAll('.delete-game');

deleteButtons.forEach(button => {
    button.addEventListener('click', function() {
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
                window.location.reload();
            } else {
                alert(data.error || 'Failed to delete game');
            }
        })
        .catch(err => {
            console.error('Error deleting game:', err);
            alert('Error deleting game. Please try again.');
        });
    });
});