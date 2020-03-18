
// The Engine class (significantly changed from the original files)
// handles the underlying procedure of game operation while leaving specific behaviour
// (such as rendering, user control and entity interactions) are left to the app script
// to define, allowing for proper separation of concerns.
class Engine {
    constructor(level, entities) {
        this.level = level;
        this.entities = entities;
        this.lastTime = 0;
        this.allowInitialisation = false;

        this.prepareResources();
        this.setupCanvas();
    }

    setupCanvas() {
        const canvasYOffset = 55; // transparent area at top of image, enlarge canvas to account for this

        const doc = window.document;
        this.canvas = doc.createElement('canvas');
        const ctx = this.canvas.getContext('2d');

        this.canvas.width = this.level.widthPixels();
        this.canvas.height = this.level.heightPixels() + canvasYOffset;
        doc.body.appendChild(this.canvas);

        // Assign context to a global variable so it can be used in the app file
        window.ctx = ctx;
    }

    prepareResources() {
        const that = this;
        Resources.onReady(() => that.run());
        Resources.load([
            'images/stone-block.png',
            'images/water-block.png',
            'images/grass-block.png',
            'images/enemy-bug.png',
            'images/char-boy.png'
        ]);
    }

    run() {
        this.initialise();
        this.runLoopIteration();
    }

    // Some initial setup including setting the lastTime variable so that the main game loop
    // has an initial value to work with
    initialise() {
        //while (!this.allowInitialisation);
        this.reset();
        this.lastTime = Date.now();
    }

    // This is looped over and over to produce the game animation
    runLoopIteration() {
        // Get time taken for the last frame to determine movement distances for entities
        // This doesn't need to be more than 100ms
        // (for debugging purposes there may be very large gaps between frames)
        const dt = Math.min(0.1, this.updateTimer());

        // Pass the change in time to the update function so that the animation can be consisten
        // regardless of screen/browser refresh rate
        this.update(dt);

        this.render();

        // Call on the browser to draw the next frame, then return to this function
        const that = this;
        window.requestAnimationFrame(() => that.runLoopIteration());
    }

    // Keeps track of time per frame so that animations may be displayed smoothly regardless of
    // screen or browser refresh rate. Returns the length of time to process the previous frame
    // in seconds.
    updateTimer() {
        const now = Date.now();
        const dt = (now - this.lastTime) / 1000.0;
        this.lastTime = now;
        return dt;
    }

    // Function for collective handling the updating of the game state
    // (in particular, movement and iteraction of entities)
    update(dt) {
        this.entities.update(dt);
    }

    // Draws the current game level and entities using helper functions
    render() {
        this.renderLevel();
        this.renderEntities();
    }

    // Draws the background for the current game level
    renderLevel() {
        // Before drawing, clear existing canvas
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let row = 0; row < this.level.heightTiles; row++) {
            for (let col = 0; col < this.level.widthTiles; col++) {
                const fileName = this.level.getTile(row, col);
                ctx.drawImage(Resources.get(fileName), col * this.level.tileWidth, row * this.level.tileHeight);
            }
        }
    }

    // Draws the entities for the current game level
    renderEntities() {
        this.entities.enemies.forEach(enemy => enemy.render());
        this.entities.player.render();
    }

    // Currently a no-op but may be used to reset the canvas in future
    reset() {
        // noop
    }
}

function setup() {
    const level = new Level();

    const inputHandler = new InputHandler();

    const entities = new Entities(inputHandler, level);

    // Constructing the Engine is enough to run the game (via a series of callbacks)
    const engine = new Engine(level, entities);
}

setup();