// levels.js
// Defines the levels that the game progresses through

// This is effectively an abstract base class for a level in the game
// A Level object cannot be created by itself but instead should be inherited from the create a new class.
// Inheriting classes should delegate to this constructor (using super()), then:
//  - optionally, set "start", a location object with properties x and y to define the location the player starts in (in pixels)
//  - set "stoneRows", the number of stone rows and hence rows in which enemies can move
//  - set "enemyFrequency", the relative frequency with which enemies spawn (per row)
//  - set "enemyMinSpeed" amd "enemyMaxSpeed"; enemy speeds will vary between these two values in units of pixel/second
//  - call this.generateTiles() after the above have been set
class Level {
    constructor () {
        // ensure Level class is not created without extension
        if (this.constructor === Level) {
          throw new Error("Can't create a raw Level class, create a specific class that inherits from this");
        }
        // these values are set to match the width and height of the picture values
        this.tileWidth = 101;
        this.tileHeight = 83;
        // 7 tiles was found to give a better gameplay experience
        this.widthTiles = 7;
        // for now, keep water/grass rows the same between levels
        this.waterRows = 1;
        this.grassRows = 2;
        // provided as an example but should be overwritten by subclasses
        this.start = {x: this.tileWidth * 3, y: this.tileHeight * 5};
    }

    // Convenience function for accessing the tile at a particular (x, y) position
    getTile(row, col) {
        return this.tiles[row * this.widthTiles + col];
    }

    // Convenience function for getting the width of the level in pixels
    widthPixels() {
        return this.tileWidth * this.widthTiles;
    }

    // Convenience function for getting the height of the level in pixels
    heightPixels() {
        return this.tileHeight * this.heightTiles;
    }

    // Generates the tiles for this level. Requires this.stoneRows to be defined.
    generateTiles() {
        this.heightTiles = this.waterRows + this.stoneRows + this.grassRows;
        // tile storage could also be implemented as an array of arrays
        // the array just stores strings for each tile's image's filename
        this.tiles = [];
        for (let row = 0; row < this.waterRows; row++) {
            for (let column = 0; column < this.widthTiles; column++) {
                this.tiles.push('images/water-block.png');
            }
        }
        for (let row = 0; row < this.stoneRows; row++) {
            for (let column = 0; column < this.widthTiles; column++) {
                this.tiles.push('images/stone-block.png');
            }
        }
        for (let row = 0; row < this.grassRows; row++) {
            for (let column = 0; column < this.widthTiles; column++) {
                this.tiles.push('images/grass-block.png');
            }
        }
    }

    // Returns gem locations for this level.
    // For now, the gems are distributed as "1 per stone row"
    // and randomly distributed between all columns except for the ones at the very edge
    getGemLocations() {
        const gemLocations = [];
        for (let row = this.waterRows; row < this.stoneRows + this.waterRows; row++) {
            const column = Math.floor(Math.random() * (this.widthTiles - 2) + 1);
            gemLocations.push({x: this.tileWidth * column, y: this.tileHeight * row});
        }
        return gemLocations;
    }
}

// The following classes are specific subclasses of the base Level class
// The game progresses through them in sequence (see the Levels class below)

class Level1 extends Level {
    constructor () {
        super();
        this.start = {x: this.tileWidth * 3, y: this.tileHeight * 5};
        this.stoneRows = 3;
        this.enemyFrequency = 0.15;
        this.enemyMinSpeed = 100;
        this.enemyMaxSpeed = 100;
        this.generateTiles();
    }
}

class Level2 extends Level {
    constructor () {
        super();
        this.start = {x: this.tileWidth * 3, y: this.tileHeight * 6};
        this.stoneRows = 4;
        this.enemyFrequency = 0.17;
        this.enemyMinSpeed = 100;
        this.enemyMaxSpeed = 125;
        this.generateTiles();
    }
}

class Level3 extends Level {
    constructor () {
        super();
        this.start = {x: this.tileWidth * 3, y: this.tileHeight * 7};
        this.stoneRows = 5;
        this.enemyFrequency = 0.2;
        this.enemyMinSpeed = 100;
        this.enemyMaxSpeed = 150;
        this.generateTiles();
    }
}

class Level4 extends Level {
    constructor () {
        super();
        this.start = {x: this.tileWidth * 3, y: this.tileHeight * 8};
        this.stoneRows = 6;
        this.enemyFrequency = 0.23;
        this.enemyMinSpeed = 120;
        this.enemyMaxSpeed = 175;
        this.generateTiles();
    }
}

class Level5 extends Level {
    constructor () {
        super();
        this.start = {x: this.tileWidth * 3, y: this.tileHeight * 9};
        this.stoneRows = 7;
        this.enemyFrequency = 0.26;
        this.enemyMinSpeed = 140;
        this.enemyMaxSpeed = 200;
        this.generateTiles();
    }
}

class Level6 extends Level {
    constructor () {
        super();
        this.start = {x: this.tileWidth * 3, y: this.tileHeight * 9};
        this.stoneRows = 7;
        this.enemyFrequency = 0.3;
        this.enemyMinSpeed = 160;
        this.enemyMaxSpeed = 250;
        this.generateTiles();
    }
}

// Level factory class
// Creates level data on demand and handles level progression
class Levels {
    constructor() {
        // Constructors are stored instead of the levels themselves
        // This ensures that any level features are re-randomised if that level
        // is used multiple times in the same session
        this.levels = [Level1, Level2, Level3, Level4, Level5, Level6];
        this.currentLevel = 0;
    }

    // To be used when a game is initialised or reset
    // Sets the current level to the first and returns that level's data.
    reset() {
        this.currentLevel = 0;
        return new this.levels[this.currentLevel]();
    }

    // To be used when the player gets to the next level
    // Increases the current level if not already at maximum, and returns that level's data.
    next() {
        if (this.currentLevel < this.levels.length - 1) this.currentLevel++;
        return new this.levels[this.currentLevel]();
    }
}