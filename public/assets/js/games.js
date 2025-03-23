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
            <div class="game-card" data-game-id="${game.id}" data-game-type="${game.type}">
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
                const gameType = card.dataset.gameType;
                this.launchGame(gameId, gameType);
            });
        });
    }

    async launchGame(gameId, gameType) {
        const gameData = await this.findGameData(gameId);
        if (!gameData) return;

        this.gameTitle.textContent = gameData.title;

        let gameUrl;
        if (gameType === 'cdn') {
            gameUrl = gameData.url;
        } else if (gameType === 'local') {
            gameUrl = gameData.path;
        } else {
            console.error('Unknown game type:', gameType);
            return;
        }

        this.gameFrame.src = 'about:blank';
        this.showGame();
        
        setTimeout(() => {
            this.gameFrame.src = gameUrl;
        }, 100);

        this.gameFrame.onload = () => {
            console.log(`Game ${gameData.title} loaded successfully`);
        };

        this.gameFrame.onerror = () => {
            console.error(`Failed to load game ${gameData.title}`);
            this.hideGame();
        };
    }

    showGame() {
        this.iframeContainer.style.display = 'block';
        this.iframeContainer.offsetHeight;
        this.iframeContainer.classList.add('visible');
    }

    hideGame() {
        this.iframeContainer.classList.remove('visible');
        setTimeout(() => {
            this.iframeContainer.style.display = 'none';
            this.gameFrame.src = 'about:blank';
            this.gameTitle.textContent = '';
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
        try {
            const response = await fetch('/assets/json/games.json');
            const data = await response.json();
            return data.games.find(game => game.id === gameId);
        } catch (error) {
            console.error('Error fetching game data:', error);
            return null;
        }
    }
}

// Initialize and load games when the document is ready
document.addEventListener('DOMContentLoaded', () => {
    const gamesLoader = new GamesLoader();
    gamesLoader.loadGames();
});