class GameLoader {
    constructor() {
        this.gamesGrid = document.querySelector('.games-grid')
    }
    createGameCard(game) {
        return `
            <div class="game-card" data-game-id="${game.id}">
                <img src="${game.image}" alt="${game.title}">
                <div class="game-info">
                    <h3>${game.title}</h3>
                    <p>${game.description}</p>
                </div>
            </div>
        `;
    }
    async loadGames() {
        try {
            const response = await fetch('/assets/json/games.json');
            if (!response.ok) throw new Error('Failed to load games data');
            
            const data = await response.json();
            this.gamesGrid.innerHTML = '';
            data.games.forEach(game => {
                this.gamesGrid.innerHTML += this.createGameCard(game);
            });
            document.querySelectorAll('.game-card').forEach(card => {
                card.addEventListener('click', () => {
                    const gameId = card.dataset.gameId

                    this.launchGame(gameId)
                })
            })
        } catch(err) {
            console.error("Error loading games: ", err)
        }
    }
    launchGame(gameId) {
        const gameData = this.findGameData(gameId);
        if (gameData && gameData.url) {
            window.location.href = gameData.url;
        }
    }

    async findGameData(gameId) {
        const response = await fetch('/assets/js/games.json');
        const data = await response.json();
        return data.games.find(game => game.id === gameId);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const gamesLoader = new GameLoader();
    gamesLoader.loadGames();
});