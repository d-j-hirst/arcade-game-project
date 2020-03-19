class Level {
    constructor () {
        this.tileWidth = 101;
        this.tileHeight = 83;
        this.widthTiles = 5;
        this.heightTiles = 6;
        this.tiles = [];
        this.generateTiles();
    }

    generateTiles() {
        for (let column = 0; column < this.widthTiles; column++) {
            this.tiles.push('images/water-block.png');
        }
        for (let row = 0; row < 3; row++) {
            for (let column = 0; column < this.widthTiles; column++) {
                this.tiles.push('images/stone-block.png');
            }
        }
        for (let row = 0; row < 2; row++) {
            for (let column = 0; column < this.widthTiles; column++) {
                this.tiles.push('images/grass-block.png');
            }
        }
    }

    getTile(row, col) {
        return this.tiles[row * this.widthTiles + col];
    }

    widthPixels() {
        return this.tileWidth * this.widthTiles;
    }

    heightPixels() {
        return this.tileHeight * this.heightTiles;
    }
}

class InputHandler {
    constructor() {
        this.allowedKeys = {
            37: 'left',
            38: 'up',
            39: 'right',
            40: 'down'
        };
        this.pressedKeys = [];
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        document.addEventListener('keydown', e => {
            const keyValue = this.allowedKeys[e.keyCode];
            if (!this.pressedKeys.includes(keyValue)) this.pressedKeys.push(keyValue);
        });
        document.addEventListener('keyup', e => {
            const keyValue = this.allowedKeys[e.keyCode];
            const keyIndex = this.pressedKeys.indexOf(keyValue);
            if (keyIndex !== -1) this.pressedKeys.splice(keyIndex, 1);
        });
    }

    isPressed(keyValue) {
        return this.pressedKeys.includes(keyValue);
    }
}

// Base class for any object (including enemies, player(s), other interactives)
// that are drawn onto a position on the screen
class Entity {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.sprite = '';
    }

    // Moves an entity by a velocity given by x and y (in pixels/s)
    // multiplied by the time variable dt
    shiftPosition(x, y, dt) {
        this.x += x * dt;
        this.y += y * dt;
    }

    // In order for this function to work a subclass must
    // set the "sprite" property to a string containing a valid image file name
    render() {
        if (this.sprite) {
            // entity sprites are not quite aligned with level block sprites,
            // this places them "on top of" level blocks
            const EntityYAdjust = 15;
            ctx.drawImage(Resources.get(this.sprite), this.x, this.y - EntityYAdjust);
        }
    }

    update(dt) {};
}

class Enemy extends Entity {
    constructor(x, y, movement = {x: 0, y: 0}) {
        super(x, y);
        this.sprite = 'images/enemy-bug.png';
        this.movement = movement;
    }

    update(dt) {
        this.shiftPosition(this.movement.x, this.movement.y, dt);
    }
}

class Player extends Entity {
    constructor(x, y, inputs, level) {
        super(x, y);
        this.width = 100;
        this.height = 100;
        this.sprite = 'images/char-boy.png';
        this.inputs = inputs;
        this.level = level;
    }

    update(dt) {
        if (this.inputs.isPressed('left')) {
            this.shiftPosition(-100, 0, dt);
        }
        if (this.inputs.isPressed('right')) {
            this.shiftPosition(100, 0, dt);
        }
        if (this.inputs.isPressed('up')) {
            this.shiftPosition(0, -100, dt);
        }
        if (this.inputs.isPressed('down')) {
            this.shiftPosition(0, 100, dt);
        }
        // Ensure player does not move off the edge of the level
        this.x = Math.max(0, this.x);
        this.y = Math.max(0, this.y);
        this.x = Math.min(this.x, this.level.widthPixels() - this.level.tileWidth);
        this.y = Math.min(this.y, this.level.heightPixels() - this.level.tileHeight);
    }
}

class Entities {
    constructor(inputs, level) {
        this.enemies = Array(level.heightTiles - 1).fill(new Enemy(0, 0, false));
        this.player = new Player(level.tileWidth * 2, level.tileHeight * 0, inputs, level);
        this.inputs = inputs;
        this.level = level;
    }

    // Returns true if the game
    update(dt) {
        this.checkEnemyCreation(dt);
        this.checkEnemyRemoval();
        this.enemies.forEach(enemy => enemy.update(dt));
        this.player.update(dt);
        const collisionOccurred = this.checkCollisions();
        return !collisionOccurred;
    }

    checkEnemyCreation(dt) {
        const ENEMY_CREATION_CHANCE = 0.5;
        if (Math.random() < dt * ENEMY_CREATION_CHANCE) {
            // don't create enemies in top or bottom rows
            const row = Math.floor(Math.random() * (this.level.heightTiles - 2) + 1);
            // place enemies at either the left or right edge of screen
            // and set their movement to travel to the other side
            if (Math.random() < 0.5) {
                this.enemies.push(new Enemy(-this.level.tileWidth, row * this.level.tileHeight, {x: 100, y: 0}));
            } else {
                this.enemies.push(new Enemy(this.level.widthPixels() + this.level.tileWidth, row * this.level.tileHeight, {x: -100, y: 0}));
            }
        }
    }

    checkEnemyRemoval() {
        let toBeRemoved = -1;
        do {
            toBeRemoved = -1;
            for (let enemyIndex = 0; enemyIndex < this.enemies.length; enemyIndex++) {
                let removeEnemy = false;
                const enemyToCheck = this.enemies[enemyIndex];
                if (enemyToCheck.x <= -this.level.tileWidth && enemyToCheck.movement.x < 0) removeEnemy = true;
                if (enemyToCheck.x >= this.level.widthPixels() && enemyToCheck.movement.x > 0) removeEnemy = true;
                if (removeEnemy) {
                    toBeRemoved = enemyIndex;
                    break;
                }
            }
            if (toBeRemoved >= 0) {
                this.enemies.splice(toBeRemoved, 1);
            }
        } while (toBeRemoved >= 0);
    }

    // Returns true if there is a collision between the player and an enemy,
    // and false otherwise
    checkCollisions() {
        for (let enemy of this.enemies) {
            const distance = Math.hypot(this.player.x - enemy.x, this.player.y - enemy.y);
            // 0.6 here is just determined by manual testing
            // to be the furthest distance that will only ever trigger
            // when the sprites are visually touching
            if (distance < this.level.tileWidth * 0.6) return true;
        }
        return false;
    }
}