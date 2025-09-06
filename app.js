class WumpusWorld {
    constructor() {
        this.gridSize = 4;
        this.directions = ['up', 'right', 'down', 'left'];
        this.directionVectors = {
            'up': [0, 1],
            'right': [1, 0], 
            'down': [0, -1],
            'left': [-1, 0]
        };
        this.directionIcons = {
            'up': '↑',
            'right': '→',
            'down': '↓',
            'left': '←'
        };
        
        this.initializeGame();
        this.setupEventListeners();
        this.updatePerceptions();
        this.updateDisplay();
        this.showMessage('Welcome to Wumpus World! Find the gold and return to [1,1] to win.');
    }

    initializeGame() {
        this.playerX = 1;
        this.playerY = 1;
        this.facing = 'right';
        this.score = 0;
        this.arrows = 1;
        this.hasGold = false;
        this.gameState = 'playing'; // 'playing', 'won', 'lost'
        this.visitedCells = new Set();
        this.visitedCells.add(`${this.playerX},${this.playerY}`);
        
        this.currentPerceptions = new Set();
        
        this.generateWorld();
        
        console.log('Game initialized successfully');
        console.log('World layout:', this.grid);
    }

    generateWorld() {
        this.grid = {};
        for (let x = 1; x <= this.gridSize; x++) {
            for (let y = 1; y <= this.gridSize; y++) {
                this.grid[`${x},${y}`] = {};
            }
        }

        const availablePositions = [];
        for (let x = 1; x <= this.gridSize; x++) {
            for (let y = 1; y <= this.gridSize; y++) {
                if (x !== 1 || y !== 1) {
                    availablePositions.push([x, y]);
                }
            }
        }

        const wumpusIndex = Math.floor(Math.random() * availablePositions.length);
        const wumpusPos = availablePositions.splice(wumpusIndex, 1)[0];
        this.grid[`${wumpusPos[0]},${wumpusPos[1]}`].wumpus = true;
        this.wumpusAlive = true;
        console.log('Wumpus placed at:', wumpusPos);

        const goldIndex = Math.floor(Math.random() * availablePositions.length);
        const goldPos = availablePositions.splice(goldIndex, 1)[0];
        this.grid[`${goldPos[0]},${goldPos[1]}`].gold = true;
        console.log('Gold placed at:', goldPos);

        for (let i = 0; i < 3 && availablePositions.length > 0; i++) {
            const pitIndex = Math.floor(Math.random() * availablePositions.length);
            const pitPos = availablePositions.splice(pitIndex, 1)[0];
            this.grid[`${pitPos[0]},${pitPos[1]}`].pit = true;
            console.log('Pit placed at:', pitPos);
        }
    }

    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        const forwardBtn = document.getElementById('forward');
        const turnLeftBtn = document.getElementById('turnLeft');
        const turnRightBtn = document.getElementById('turnRight');
        
        if (forwardBtn) forwardBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Forward button clicked');
            this.moveForward();
        });
        
        if (turnLeftBtn) turnLeftBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Turn left button clicked');
            this.turnLeft();
        });
        
        if (turnRightBtn) turnRightBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Turn right button clicked');
            this.turnRight();
        });
        
        const grabBtn = document.getElementById('grab');
        const shootBtn = document.getElementById('shoot');
        const climbBtn = document.getElementById('climb');
        
        if (grabBtn) grabBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Grab button clicked');
            this.grab();
        });
        
        if (shootBtn) shootBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Shoot button clicked');
            this.shoot();
        });
        
        if (climbBtn) climbBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Climb button clicked');
            this.climb();
        });
        
        const restartBtn = document.getElementById('restartGame');
        if (restartBtn) restartBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Restart button clicked');
            this.restartGame();
        });
        
        console.log('Event listeners set up successfully');
    }

    moveForward() {
        if (this.gameState !== 'playing') {
            console.log('Game not in playing state');
            return;
        }

        console.log(`Attempting to move forward from [${this.playerX},${this.playerY}] facing ${this.facing}`);

        const vector = this.directionVectors[this.facing];
        const newX = this.playerX + vector[0];
        const newY = this.playerY + vector[1];

        console.log(`New position would be: [${newX},${newY}]`);

        if (newX < 1 || newX > this.gridSize || newY < 1 || newY > this.gridSize) {
            console.log('Hit wall, adding bump perception');
            this.addPerception('bump');
            this.showMessage('Bump! You hit a wall.');
            this.updateDisplay();
            return;
        }

        this.playerX = newX;
        this.playerY = newY;
        this.score -= 1;
        this.visitedCells.add(`${this.playerX},${this.playerY}`);

        console.log(`Player moved to [${this.playerX},${this.playerY}]`);

        const currentCell = this.grid[`${this.playerX},${this.playerY}`];
        
        if (currentCell.wumpus && this.wumpusAlive) {
            this.gameState = 'lost';
            this.score -= 1000;
            this.showMessage('💀 The Wumpus devoured you! Game Over.');
            this.endGame('You were eaten by the Wumpus!');
            return;
        }

        if (currentCell.pit) {
            this.gameState = 'lost';
            this.score -= 1000;
            this.showMessage('🕳️ You fell into a pit! Game Over.');
            this.endGame('You fell into a bottomless pit!');
            return;
        }

        this.updatePerceptions();
        this.updateDisplay();
        this.showMessage(`Moved to [${this.playerX},${this.playerY}]`);
    }

    turnLeft() {
        if (this.gameState !== 'playing') return;
        
        console.log(`Turning left from ${this.facing}`);
        const currentIndex = this.directions.indexOf(this.facing);
        this.facing = this.directions[(currentIndex + 3) % 4];
        this.score -= 1;
        console.log(`Now facing ${this.facing}`);
        this.updateDisplay();
        this.showMessage(`Turned left, now facing ${this.facing}`);
    }

    turnRight() {
        if (this.gameState !== 'playing') return;
        
        console.log(`Turning right from ${this.facing}`);
        const currentIndex = this.directions.indexOf(this.facing);
        this.facing = this.directions[(currentIndex + 1) % 4];
        this.score -= 1;
        console.log(`Now facing ${this.facing}`);
        this.updateDisplay();
        this.showMessage(`Turned right, now facing ${this.facing}`);
    }

    grab() {
        if (this.gameState !== 'playing') return;

        console.log('Attempting to grab');
        const currentCell = this.grid[`${this.playerX},${this.playerY}`];
        
        if (currentCell.gold && !this.hasGold) {
            this.hasGold = true;
            currentCell.gold = false;
            console.log('Gold grabbed successfully');
            this.showMessage('💰 You picked up the gold! Now return to [1,1] and climb to win!');
        } else if (this.hasGold) {
            this.showMessage('You already have the gold!');
        } else {
            this.showMessage('There is no gold here to grab.');
        }

        this.updateDisplay();
    }

    shoot() {
        if (this.gameState !== 'playing') return;
        
        if (this.arrows <= 0) {
            this.showMessage('You have no arrows left!');
            return;
        }

        console.log('Shooting arrow');
        this.arrows--;
        this.score -= 10;

        const vector = this.directionVectors[this.facing];
        let arrowX = this.playerX;
        let arrowY = this.playerY;
        let hit = false;

        while (!hit) {
            arrowX += vector[0];
            arrowY += vector[1];

            if (arrowX < 1 || arrowX > this.gridSize || arrowY < 1 || arrowY > this.gridSize) {
                hit = true;
                this.showMessage('🏹 Your arrow hit the wall and was lost.');
                break;
            }

            const cell = this.grid[`${arrowX},${arrowY}`];
            if (cell.wumpus && this.wumpusAlive) {
                this.wumpusAlive = false;
                cell.wumpus = false;
                hit = true;
                this.addPerception('scream');
                this.showMessage('💀 You hear a terrible scream! The Wumpus is dead!');
                console.log('Wumpus killed by arrow');
                
                setTimeout(() => {
                    this.updatePerceptions();
                    this.updateDisplay();
                }, 1000);
                break;
            }
        }

        this.updateDisplay();
    }

    climb() {
        if (this.gameState !== 'playing') return;

        console.log('Attempting to climb');
        if (this.playerX !== 1 || this.playerY !== 1) {
            this.showMessage('You can only climb out from the starting position [1,1]!');
            return;
        }

        if (!this.hasGold) {
            this.showMessage('You need to find the gold before you can escape!');
            return;
        }

        this.gameState = 'won';
        this.score += 1000;
        console.log('Player won the game!');
        this.showMessage('Congratulations! You escaped with the gold!');
        this.endGame('Victory! You escaped with the gold!');
    }

    updatePerceptions() {
        this.clearPerceptions();

        const currentCell = this.grid[`${this.playerX},${this.playerY}`];
        
        if (currentCell.gold) {
            this.addPerception('glitter');
            console.log('Gold detected - adding glitter perception');
        }

        for (const direction of this.directions) {
            const vector = this.directionVectors[direction];
            const adjX = this.playerX + vector[0];
            const adjY = this.playerY + vector[1];

            if (adjX < 1 || adjX > this.gridSize || adjY < 1 || adjY > this.gridSize) {
                continue;
            }

            const adjCell = this.grid[`${adjX},${adjY}`];
            
            if (adjCell.wumpus && this.wumpusAlive) {
                this.addPerception('stench');
                console.log('Wumpus detected nearby - adding stench perception');
            }

            if (adjCell.pit) {
                this.addPerception('breeze');
                console.log('Pit detected nearby - adding breeze perception');
            }
        }
        
        console.log('Current perceptions:', Array.from(this.currentPerceptions));
    }

    addPerception(perception) {
        this.currentPerceptions.add(perception);
        console.log('Added perception:', perception);
        
        if (perception === 'bump' || perception === 'scream') {
            setTimeout(() => {
                this.currentPerceptions.delete(perception);
                this.updateDisplay();
            }, 2000);
        }
    }

    clearPerceptions() {
        const hasScream = this.currentPerceptions.has('scream');
        this.currentPerceptions.clear();
        if (hasScream) {
            this.currentPerceptions.add('scream');
        }
    }

    updateDisplay() {
        console.log('Updating display');
        this.updateGrid();
        this.updateStatus();
        this.updatePerceptionDisplay();
        this.updateControls();
    }

    updateGrid() {
        const gridElement = document.getElementById('gameGrid');
        if (!gridElement) {
            console.error('Grid element not found');
            return;
        }
        
        gridElement.innerHTML = '';

        for (let y = this.gridSize; y >= 1; y--) {
            for (let x = 1; x <= this.gridSize; x++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.id = `cell-${x}-${y}`;

                const cellData = this.grid[`${x},${y}`] || {};
                const isPlayerHere = (x === this.playerX && y === this.playerY);
                const isVisited = this.visitedCells.has(`${x},${y}`);

                if (isPlayerHere) {
                    cell.classList.add('player');
                }
                if (isVisited && !isPlayerHere) {
                    cell.classList.add('visited');
                }

                if (isPlayerHere) {
                    if (this.currentPerceptions.has('stench')) {
                        cell.classList.add('stench');
                    }
                    if (this.currentPerceptions.has('breeze')) {
                        cell.classList.add('breeze');
                    }
                    if (this.currentPerceptions.has('glitter')) {
                        cell.classList.add('glitter');
                    }
                }

                if (isPlayerHere) {
                    const playerIcon = document.createElement('div');
                    playerIcon.className = 'player-icon';
                    playerIcon.textContent = this.directionIcons[this.facing];
                    cell.appendChild(playerIcon);
                }

                if (isVisited || this.gameState !== 'playing') {
                    if (cellData.wumpus && this.wumpusAlive) {
                        const wumpus = document.createElement('div');
                        wumpus.className = 'game-object';
                        wumpus.textContent = '👹';
                        wumpus.title = 'Wumpus';
                        if (!isPlayerHere) cell.appendChild(wumpus);
                        cell.classList.add('wumpus');
                    }

                    if (cellData.gold && !this.hasGold) {
                        const gold = document.createElement('div');
                        gold.className = 'game-object';
                        gold.textContent = '🏆';
                        gold.title = 'Gold';
                        if (!isPlayerHere) cell.appendChild(gold);
                        cell.classList.add('gold');
                    }

                    if (cellData.pit) {
                        const pit = document.createElement('div');
                        pit.className = 'game-object';
                        pit.textContent = '🕳️';
                        pit.title = 'Pit';
                        if (!isPlayerHere) cell.appendChild(pit);
                        cell.classList.add('pit');
                    }
                }

                gridElement.appendChild(cell);
            }
        }
    }

    updateStatus() {
        const elements = {
            score: document.getElementById('score'),
            position: document.getElementById('position'),
            facing: document.getElementById('facing'),
            arrows: document.getElementById('arrows'),
            hasGold: document.getElementById('hasGold')
        };

        if (elements.score) elements.score.textContent = this.score;
        if (elements.position) elements.position.textContent = `[${this.playerX},${this.playerY}]`;
        if (elements.facing) elements.facing.textContent = 
            this.facing.charAt(0).toUpperCase() + this.facing.slice(1);
        if (elements.arrows) elements.arrows.textContent = this.arrows;
        if (elements.hasGold) elements.hasGold.textContent = this.hasGold ? 'Yes' : 'No';
    }

    updatePerceptionDisplay() {
        const perceptions = ['stench', 'breeze', 'glitter', 'bump', 'scream'];
        
        perceptions.forEach(perception => {
            const element = document.getElementById(perception);
            if (element) {
                if (this.currentPerceptions.has(perception)) {
                    element.classList.add('active');
                } else {
                    element.classList.remove('active');
                }
            }
        });
    }

    updateControls() {
        const controls = ['forward', 'turnLeft', 'turnRight', 'grab', 'shoot', 'climb'];
        controls.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.disabled = (this.gameState !== 'playing');
            }
        });

        if (this.gameState === 'playing') {
            const shootBtn = document.getElementById('shoot');
            if (shootBtn) {
                shootBtn.disabled = (this.arrows <= 0);
            }
        }
    }

    showMessage(message) {
        const messageElement = document.getElementById('gameMessage');
        if (messageElement) {
            messageElement.textContent = message;
        }

        document.body.classList.remove('game-won', 'game-lost');
        if (this.gameState === 'won') {
            document.body.classList.add('game-won');
        } else if (this.gameState === 'lost') {
            document.body.classList.add('game-lost');
        }
        
        console.log('Message:', message);
    }

    endGame(message) {
        const modal = document.getElementById('gameOverModal');
        const title = document.getElementById('gameOverTitle');
        const messageEl = document.getElementById('gameOverMessage');
        const finalScore = document.getElementById('finalScore');

        if (title) title.textContent = this.gameState === 'won' ? 'Victory' : 'Game Over';
        if (messageEl) messageEl.textContent = message;
        if (finalScore) finalScore.textContent = this.score;
        if (modal) modal.classList.remove('hidden');
        
        console.log('Game ended:', message, 'Score:', this.score);
    }

    restartGame() {
        const modal = document.getElementById('gameOverModal');
        if (modal) modal.classList.add('hidden');
        
        document.body.classList.remove('game-won', 'game-lost');
        this.initializeGame();
        this.updatePerceptions();
        this.updateDisplay();
        this.showMessage('New game started! Find the gold and return to [1,1] to win.');
        console.log('Game restarted');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing game...');
    try {
        window.game = new WumpusWorld();
        console.log('Game created successfully');
    } catch (error) {
        console.error('Error creating game:', error);
    }
});