class GamesLoader {
    constructor() {
        this.gamesGrid = document.querySelector('.games-grid');
        this.iframeContainer = document.querySelector('.iframe-container');
        this.gameFrame = document.getElementById('gameFrame');
        this.closeBtn = document.getElementById('closeBtn');
        this.fullscreenBtn = document.getElementById('fullscreenBtn');
        this.gameTitle = document.querySelector('.game-title');
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.closeBtn.addEventListener('click', () => this.hideGame());
        this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
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

            this.addClickHandlers();

        } catch (error) {
            console.error('Error loading games:', error);
            this.gamesGrid.innerHTML = '<p class="error">Failed to load games</p>';
        }
    }

    addClickHandlers() {
        const gameCards = document.querySelectorAll('.game-card');
        gameCards.forEach(card => {
            card.addEventListener('click', () => {
                const gameId = card.dataset.gameId;
                this.launchGame(gameId);
            });
        });
    }

    async launchGame(gameId) {
        const gameData = await this.findGameData(gameId);
        if (gameData && gameData.url) {
            this.gameTitle.textContent = gameData.title;
            this.gameFrame.src = gameData.url;
            this.showGame();
        }
    }

    showGame() {
        this.iframeContainer.style.display = 'block';
        // Trigger reflow
        this.iframeContainer.offsetHeight;
        this.iframeContainer.classList.add('visible');
    }

    hideGame() {
        this.iframeContainer.classList.remove('visible');
        setTimeout(() => {
            this.iframeContainer.style.display = 'none';
            this.gameFrame.src = 'about:blank';
        }, 300);
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            this.gameFrame.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    }

    async findGameData(gameId) {
        const response = await fetch('/assets/json/games.json');
        const data = await response.json();
        return data.games.find(game => game.id === gameId);
    }
}

// Initialize and load games when the document is ready
document.addEventListener('DOMContentLoaded', () => {
    const gamesLoader = new GamesLoader();
    gamesLoader.loadGames();
});