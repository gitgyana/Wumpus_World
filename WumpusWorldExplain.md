# Wumpus World JavaScript File (`app.js`) Explanation

Below is a detailed walkthrough of all classes, methods, and logic in this Wumpus World implementation.

***

## Game Class: `WumpusWorld`

This class encapsulates all the mechanics, state, and rendering for the Wumpus World game.

### Constructor: `constructor()`
```js
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
```
- **Purpose**: Initializes the game's size, directions, player icons, and starts the first game.
- **Logic**:
    - Defines the grid’s size (`4x4`) and sets direction vectors (for movement).
    - Symbolically maps each direction to an arrow.
    - Calls initializers: game state, DOM event listeners, perceptions, display, and welcome message.

***

### Game Initialization: `initializeGame()`
```js
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
```
- **Purpose**: Sets up player stats, positions, perceptions, and generates a new game board.
- **Logic**:
    - Player starts at `[1,1]`, facing right, with full score and one arrow.
    - Gold not collected, game is “playing”, and starting cell is recorded as visited.
    - Perceptions are empty for now.
    - Calls `generateWorld()` to randomly populate the map.
    - Logs game state and world layout for debugging.

***

### Board Generation: `generateWorld()`
```js
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
```
- **Purpose**: Randomly places the Wumpus, gold, and pits around the grid, but not at the starting cell.
- **Logic**:
    - Allocates empty cell objects for every coordinate.
    - Builds a list of all positions except the start.
    - Picks and places Wumpus, gold, and three pits at random locations by removing them from a pool of available positions.
    - Sets a flag that the Wumpus is alive.
    - Logs the positions of all hazards and treasures.

***

### Event Registration: `setupEventListeners()`
```js
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
```
- **Purpose**: Registers DOM click handlers for all user controls (move, turn, grab, shoot, climb, restart).
- **Logic**:
    - Grabs all buttons by ID.
    - Assigns a click event for each button, connecting it to the relevant class method.
    - Logs each binding and event for debugging.

***

### Player Actions

#### Move Forward: `moveForward()`
```js
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
```
- **Purpose**: Moves the player in the current facing direction, unless blocked by the wall.
- **Logic**:
    - Checks if the game is “playing” before moving.
    - Uses direction vector to compute new coordinates.
    - If new position is out-of-bounds, adds "bump" perception and aborts.
    - Else, applies the move:
        - Decreases score by 1.
        - If new cell has a *live* Wumpus or pit, ends the game with a loss.
        - Else, updates perceptions and re-renders.
    - Logs every important state change.

#### Turn Left/Right: `turnLeft()` and `turnRight()`
```js
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
```
- **Purpose**: Rotates the facing direction (without moving position).
- **Logic**:
    - Updates facing direction by rotating the array pointer; decreases score by 1.
    - Shows a message reflecting the new direction.

#### Grab Gold: `grab()`
```js
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
```
- **Purpose**: Picks up gold if the player is standing on it.
- **Logic**:
    - If gold present and not already collected, marks gold as collected, sets cell’s gold to false, and notifies the user.
    - Handles cases where no gold is present or already held.

#### Shoot Arrow: `shoot()`
```js
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
```
- **Purpose**: Shoots an arrow straight in the facing direction, kills the Wumpus if hit.
- **Logic**:
    - Only allowed if arrows are remaining.
    - Arrow flies in a straight line across cells:
        - If out-of-bounds: arrow lost.
        - If it finds a *live* Wumpus in the path: kills it, adds “scream” perception.
    - Deducts 10 points for shooting, and renders the result.

#### Climb (Escape): `climb()`
```js
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
```
- **Purpose**: Escapes the cave to win the game—but only if you're back at `[1,1]` and holding the gold.
- **Logic**:
    - Checks if player is on starting cell.
    - If the player has gold, the game is won, score increases by 1000, game is ended.
    - Otherwise, shows contextual messages on failure.

***

### Perceptions

#### Update Perception Status: `updatePerceptions()`
```js
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
```
- **Purpose**: Checks & sets which perceptions (stench, breeze, glitter) are present.
- **Logic**:
    - If gold is underfoot, add “glitter”.
    - For each direction, checks adjacent cells for a live Wumpus (“stench”) or a pit (“breeze”) and updates perceptions.
    - Perceptions like “bump” and “scream” are temporary.

#### Helpers: `addPerception(perception)` and `clearPerceptions()`
```js
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
```
- **Purpose**:
    - `addPerception`: Adds a perception, optionally removing it after delay for bump and scream.
    - `clearPerceptions`: Clears all—except possibly “scream”—for correct game feedback.

***

### Rendering & Display

#### Update Display: `updateDisplay()`
```js
updateDisplay() {
    console.log('Updating display');
    this.updateGrid();
    this.updateStatus();
    this.updatePerceptionDisplay();
    this.updateControls();
}
```
- **Purpose**: Orchestrates all visual updates and player feedback.
- **Logic**:
    - Paints the game grid, status panel, perception displays, and button states.

#### Grid Drawing: `updateGrid()`
```js
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
```
- **Purpose**: Re-draws the grid cells, placing icons for player, gold, pits, wumpus, and applying CSS classes.
- **Logic**:
    - For every cell:  
        - Decorates with classes according to cell content and player state.
        - Places the correct emoji/icon.
        - Visited-only cells are visually different.
    - Only *visited* or *game over* cells show their hazards.

#### Status Panel: `updateStatus()`
```js
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
```
- **Purpose**: Updates on-screen game stats (score, position, arrows left, etc.).
- **Logic**:
    - Finds DOM elements by ID and writes updated values.

#### Perception Feedback: `updatePerceptionDisplay()`
```js
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
```
- **Purpose**: Highlights which perceptions (like “breeze”, "stench") are active.
- **Logic**:
    - Each corresponding DOM element is toggled with the “active” class.

#### Button States: `updateControls()`
```js
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
```
- **Purpose**: Enables/disables action buttons according to game state.
- **Logic**:
    - All buttons are turned off if the game is not playable. “Shoot” disables itself if arrows are depleted.

***

### User Feedback & End Game

#### Messaging: `showMessage(message)`
```js
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
```
- **Purpose**: Displays status or event messages, and sets end-of-game UI states.
- **Logic**:
    - Writes the message.
    - Sets CSS classes for win/lose feedback.

#### End Game Modal: `endGame(message)`
```js
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
```
- **Purpose**: Triggers the game over modal, displaying win/lose status, score, and message.
- **Logic**:
    - Updates the modal with the appropriate message, header, hide/re-show logic.

#### Restart Game: `restartGame()`
```js
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
```
- **Purpose**: Resets to a new game.
- **Logic**:
    - Hides the modal, resets body state, and restarts all initial setup and UI update steps.

***

### Bootstrapping: Document Ready
```js
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing game...');
    try {
        window.game = new WumpusWorld();
        console.log('Game created successfully');
    } catch (error) {
        console.error('Error creating game:', error);
    }
});
```
- **Purpose**: Once the DOM loads, creates a new instance of the game and makes it globally accessible (for debugging or hot restart).

***

# Summary Table

| **Method**                | **Purpose**                                             | **Key Actions**                 |
|---------------------------|---------------------------------------------------------|---------------------------------|
| `constructor`             | Initializes constants and launches the game             | Calls all initializers          |
| `initializeGame`          | Resets state and places objects                         | Sets player state, places world |
| `generateWorld`           | Randomly assigns Wumpus, gold, and pits                 | Updates grid                    |
| `setupEventListeners`     | Registers UI handlers for every button                  | Binds to class methods          |
| `moveForward`             | Moves agent in current direction                        | Handles wall, death, feedback   |
| `turnLeft/turnRight`      | Rotates facing direction                                | Updates direction               |
| `grab`                    | Picks up gold if present                                | Toggles gold flags, feedback    |
| `shoot`                   | Arrow travels in facing direction                       | Handles Wumpus kill, feedback   |
| `climb`                   | Attempts to escape at starting cell                     | Checks victory conditions       |
| `updatePerceptions`       | Updates current logical perceptions                     | Triggers status feedback        |
| `addPerception`           | Adds a perception (with timed removal for some)         | UI highlight/haptic event       |
| `clearPerceptions`        | Resets all perceptions                                  | Keeps "scream" if present       |
| `updateDisplay`           | Updates all UI regions                                  | Calls grid/render methods       |
| `updateGrid`              | Redraws the game board                                  | Places all visible icons        |
| `updateStatus`            | Updates panel with stats                                | Sets text in UI elements        |
| `updatePerceptionDisplay` | Updates active perceptions’ highlights                  | Toggle classes                  |
| `updateControls`          | Disables/enables buttons                                | State-dependent                 |
| `showMessage`             | Posts a message, shows win/loss state                   | UI/UX feedback, toggles classes |
| `endGame`                 | Shows modal and writes end-game status                  | Locks input, shows scores       |
| `restartGame`             | Starts a new game from zero                             | Resets grid, state, and UI      |

***
