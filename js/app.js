

// Base class for any object (including enemies, player(s), other interactives)
// that are drawn onto a position on the screen
class Entity {
    constructor(pos = {x: 0, y: 0}) {
        this.pos = Object.assign({}, pos);
        this.sprite = '';
    }

    // Moves an entity by a velocity given by x and y (in pixels/s)
    // multiplied by the time variable dt
    move(velocity = {x: 0, y: 0}, dt) {
        this.pos.x += velocity.x * dt;
        this.pos.y += velocity.y * dt;
    }

    // Moves an entity by the given vector
    shiftPosition(displacement = {x: 0, y: 0}) {
        this.pos.x += displacement.x;
        this.pos.y += displacement.y;
    }

    // In order for this function to work a subclass must
    // set the "sprite" property to a string containing a valid image file name
    render() {
        if (this.sprite) {
            // entity sprites are not quite aligned with level block sprites,
            // this places them "on top of" level blocks
            const EntityYAdjust = 15;
            ctx.drawImage(Resources.get(this.sprite), this.pos.x, this.pos.y - EntityYAdjust);
        }
    }

    update(dt) {};
}

class Enemy extends Entity {
    constructor(position = {x: 0, y: 0}, movement = {x: 0, y: 0}) {
        super(position);
        this.sprite = 'images/enemy-bug.png';
        this.movement = movement;
    }

    update(dt) {
        this.move(this.movement, dt);
    }
}

class Gem extends Entity {
    constructor(position = {x: 0, y: 0}) {
        super(position);
        this.sprite = 'images/Gem Green.png';
    }
}

class Player extends Entity {
    constructor(position = {x: 0, y: 0}, level) {
        super(position);
        this.sprite = 'images/char-boy.png';
        this.level = level;
    }

    update(input) {
        if (input == 'left') {
            this.shiftPosition({x: -this.level.tileWidth, y: 0});
        }
        else if (input == 'right') {
            this.shiftPosition({x: this.level.tileWidth, y: 0});
        }
        else if (input == 'up') {
            this.shiftPosition({x: 0, y: -this.level.tileHeight});
        }
        else if (input == 'down') {
            this.shiftPosition({x: 0, y: this.level.tileHeight});
        }
        // Ensure player does not move off the edge of the level
        this.pos.x = Math.max(0, this.pos.x);
        this.pos.y = Math.max(0, this.pos.y);
        this.pos.x = Math.min(this.pos.x, this.level.widthPixels() - this.level.tileWidth);
        this.pos.y = Math.min(this.pos.y, this.level.heightPixels() - this.level.tileHeight);
    }
}

class Entities {
    constructor(level) {
        this.level = level;
        this.enemies = [];
         // always create at least one enemy
         // and possibly up to one more per row
        this.checkEnemyCreation(1000);
        for (let i = 0; i < this.level.numEnemyRows - 1; ++i) this.checkEnemyCreation(2);
        this.gems = [];
        const gemLocations = this.level.getGemLocations();
        gemLocations.forEach(gemLocation => this.gems.push(new Gem(gemLocation)));
        this.player = new Player(this.level.start, this.level);
    }

    // Returns an object containing boolean properties:
    //  -collisionOccurred: true if player collided with an enemy, false otherwise
    //  -levelWon: true if player is in the win zone, false otherwise
    update(dt) {
        this.checkEnemyCreation(dt);
        this.checkEnemyRemoval();
        this.enemies.forEach(enemy => enemy.update(dt));
        const hitEnemy = this.checkEnemyCollisions();
        const pickedUpGem = this.checkGemCollisions();
        const levelWon = this.checkPlayerWin();
        return {hitEnemy: hitEnemy, pickedUpGem: pickedUpGem, levelWon: levelWon};
    }

    checkEnemyCreation(dt) {
        const ENEMY_CREATION_CHANCE = 0.2;
        if (Math.random() < dt * this.level.enemyFrequency * this.level.stoneRows) {
            // don't create enemies in top or bottom rows
            const row = Math.floor(Math.random() * this.level.stoneRows + this.level.waterRows);
            const speed = Math.floor(Math.random() * (this.level.enemyMaxSpeed - this.level.enemyMinSpeed) + this.level.enemyMinSpeed);
            // place enemies at either the left or right edge of screen
            // and set their movement to travel to the other side
            if (Math.random() < 0.5) {
                this.enemies.push(new Enemy({x: -this.level.tileWidth, y: row * this.level.tileHeight}, {x: speed, y: 0}));
            } else {
                this.enemies.push(new Enemy({x: this.level.widthPixels() + this.level.tileWidth, y: row * this.level.tileHeight},
                 {x: -speed, y: 0}));
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
    checkEnemyCollisions() {
        for (const enemy of this.enemies) {
            if (Math.abs(this.player.pos.x - enemy.pos.x) > this.level.tileWidth * 0.77) continue;
            if (Math.abs(this.player.pos.y - enemy.pos.y) > this.level.tileWidth * 0.6) continue;
            return true;
        }
        return false;
    }

    // Returns true if there is a collision between the player and an gem,
    // and false otherwise
    // Also handles the removal of the gem picked up
    checkGemCollisions() {
        for (const gem of this.gems) {
            if (Math.abs(this.player.pos.x - gem.pos.x) > this.level.tileWidth * 0.5) continue;
            if (Math.abs(this.player.pos.y - gem.pos.y) > this.level.tileWidth * 0.5) continue;
            const gemIndex = this.gems.indexOf(gem);
            this.gems.splice(gemIndex, 1);
            return true; // can only ever pick up one gem at a time
        }
        return false;
    }

    checkPlayerWin() {
        if (this.player.pos.y < 20) return true;
        return false;
    }
}

class InputHandler {
    constructor(entities) {
        this.entities = entities;
        this.allowedKeys = {
            37: 'left',
            38: 'up',
            39: 'right',
            40: 'down'
        };
        this.inputsEnabled = false;
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        const that = this;
        document.addEventListener('keyup', e => {
            if (!that.inputsEnabled) return;
            const keyValue = that.allowedKeys[e.keyCode];
            if (keyValue) that.entities.player.update(keyValue);
        });
    }

    isPressed(keyValue) {
        return this.pressedKeys.includes(keyValue);
    }
}