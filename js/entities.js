// entities.js
// Defines the behaviour of game entities (player, enemies, gems)
// (Note that some player features are controlled at engine level)

// Base class for any object (including enemies, player(s), gems)
// that are drawn onto a position on the screen
class Entity {
    constructor(pos = {x: 0, y: 0}) {
        this.pos = Object.assign({}, pos); // this comes from the level storage, want to clone it rather than create a reference
        this.sprite = '';
    }

    // Moves an entity by a velocity given by x and y (in pixels/s)
    // multiplied by the time variable dt (for smooth animations)
    move(velocity = {x: 0, y: 0}, dt) {
        this.pos.x += velocity.x * dt;
        this.pos.y += velocity.y * dt;
    }

    // Moves an entity by exactly the given vector
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
}

// Class for enemies. Enemies move across the screen at a constant rate (may vary per enemy).
class Enemy extends Entity {
    constructor(position = {x: 0, y: 0}, movement = {x: 0, y: 0}) {
        super(position);
        this.sprite = 'images/enemy-bug.png';
        this.movement = movement;
    }

    // Updates the enemy movement based on the amount of time the previous frame lasted.
    update(dt) {
        this.move(this.movement, dt);
    }
}

// Class for gems. Gems simply stay on the screen at a location until picked up by a player or the level is reset.
class Gem extends Entity {
    constructor(position = {x: 0, y: 0}) {
        super(position);
        this.sprite = 'images/Gem Green.png';
    }
}

// Class for the player entity. Moves about the screen in discrete steps based on player input.
class Player extends Entity {
    // "level" is the current level, which is passed here as this entity
    // needs to know about the characteristics of the current level to define its movement.
    constructor(level) {
        super(level.start);
        this.sprite = 'images/char-boy.png';
        this.level = level;
    }

    // Updates the player based on the key name. Each input moves the player by exactly one tile,
    // with movement off the edge of the map being prevented.
    update(input) {
        if (input == 'left') {
            this.shiftPosition({x: -this.level.tileWidth, y: 0});
        } else if (input == 'right') {
            this.shiftPosition({x: this.level.tileWidth, y: 0});
        } else if (input == 'up') {
            this.shiftPosition({x: 0, y: -this.level.tileHeight});
        } else if (input == 'down') {
            this.shiftPosition({x: 0, y: this.level.tileHeight});
        }
        // Ensure player does not move off the edge of the level
        this.pos.x = Math.max(0, this.pos.x);
        this.pos.y = Math.max(0, this.pos.y);
        this.pos.x = Math.min(this.pos.x, this.level.widthPixels() - this.level.tileWidth);
        this.pos.y = Math.min(this.pos.y, this.level.heightPixels() - this.level.tileHeight);
    }
}

// Coordinator/Container class for the entities in the game
class Entities {
    // "level" is the current level, which is passed here as the
    // level has the parameters for creating entities.
    constructor(level) {
        this.level = level;
        this.createInitialEnemies();
        this.createGems();
        this.createPlayer();
    }

    // Creates the enemies that are present when the level loads
    // Always create at least one enemy
    // and possibly up to one more per row
    createInitialEnemies() {
        this.enemies = [];
        this.checkEnemyCreation(1000);
        for (let i = 0; i < this.level.numEnemyRows - 1; ++i) this.checkEnemyCreation(2);
    }

    // Creates the gems for this level
    // Asks the level for the gem locations (which are randomly determined)
    // and then makes gem entities according to those locations
    createGems() {
        this.gems = [];
        const gemLocations = this.level.getGemLocations();
        gemLocations.forEach(gemLocation => this.gems.push(new Gem(gemLocation)));
    }

    // Creates the player for the level. Simple, but keeps the constructor code at the same level of abstraction
    createPlayer() {
        this.player = new Player(this.level);
    }

    // Returns an object containing boolean properties:
    //  -hitEnemy: true if player collided with an enemy, false otherwise
    //  -pickedUpGem: true if player picked up a gem (and didn't hit an enemy), false otherwise
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

    // Checks for creation of enemies
    // Rate of enemy creation and speed are dependent on the level settings
    checkEnemyCreation(dt) {
        if (Math.random() < dt * this.level.enemyFrequency * this.level.stoneRows) {
            // only create enemies in stone rows
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

    // Checks whether enemies should be removed from the list because they have moved off the edge of the screen
    // If this didn't happen the array of enemies could become very large over time
    // and collision checking would slow down the game
    checkEnemyRemoval() {
        for (let enemyIndex = 0; enemyIndex < this.enemies.length; enemyIndex++) {
            let removeEnemy = false;
            const enemyToCheck = this.enemies[enemyIndex];
            if (enemyToCheck.pos.x <= -this.level.tileWidth && enemyToCheck.movement.x < 0) removeEnemy = true;
            if (enemyToCheck.pos.x >= this.level.widthPixels() && enemyToCheck.movement.x > 0) removeEnemy = true;
            if (removeEnemy) {
                this.enemies.splice(enemyIndex, 1);
                enemyIndex--;
            }
        }
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

    // Checks whether the player has reached the top of the screen
    checkPlayerWin() {
        // 20 just an arbitrary number indicating "close to the top"
        // If it's ever desired to make win conditions more complex then ask the level object whether it's a winning area
        if (this.player.pos.y < 20) return true;
        return false;
    }
}

// Class that covers input for the player
class InputHandler {
    // "level" is the current entity container, which is passed here as
    // it contains the player entity that the input needs to be passed to
    constructor(entities) {
        this.entities = entities;
        this.allowedKeys = {
            37: 'left',
            38: 'up',
            39: 'right',
            40: 'down'
        };
        this.inputsEnabled = false; // inputs disabled for 2 seconds at the start of each level
        this.initializeEventListeners();
    }

    // Event listener for the "keyup" event.
    // Checks if the key pressed is a valid input key and, if so,
    // passes a string representing the semantics of the key press to the player entity
    initializeEventListeners() {
        const that = this;
        document.addEventListener('keyup', e => {
            if (!that.inputsEnabled) return;
            const keyValue = that.allowedKeys[e.keyCode];
            if (keyValue) that.entities.player.update(keyValue);
        });
    }
}