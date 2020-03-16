
// The Engine class (significantly changed from the original files)
// handles the underlying procedure of game operation while leaving specific behaviour
// (such as rendering, user control and entity interactions) are left to the app script
// to define, allowing for proper separation of concerns.
class Engine {
    constructor(map, entities) {
        this.map = map;
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

        this.canvas.width = this.map.widthPixels();
        this.canvas.height = this.map.heightPixels() + canvasYOffset;
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
        const dt = this.updateTimer();

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
        this.updateEntities(dt);
        // checkCollisions();
    }

    // updates entities according to their own rules
    updateEntities(dt) {
        entities.enemies.forEach(enemy => enemy.update(dt));
        entities.player.update(dt);
    }

    // Draws the current game level and entities using helper functions
    render() {
        this.renderLevel();
        this.renderEntities();
    }

    // Draws the background for the current game level
    renderLevel() {
        // TODO: Level information should be held in app file class and passed here

        /* This array holds the relative URL to the image used
            * for that particular row of the game level.
            */
        var rowImages = [
            'images/water-block.png',   // Top row is water
            'images/stone-block.png',   // Row 1 of 3 of stone
            'images/stone-block.png',   // Row 2 of 3 of stone
            'images/stone-block.png',   // Row 3 of 3 of stone
            'images/grass-block.png',   // Row 1 of 2 of grass
            'images/grass-block.png'    // Row 2 of 2 of grass
        ],
        numRows = this.map.heightTiles,
        numCols = this.map.widthTiles,
        row, col;

        // Before drawing, clear existing canvas
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        /* Loop through the number of rows and columns we've defined above
            * and, using the rowImages array, draw the correct image for that
            * portion of the "grid"
            */
        for (row = 0; row < numRows; row++) {
            for (col = 0; col < numCols; col++) {
                /* The drawImage function of the canvas' context element
                    * requires 3 parameters: the image to draw, the x coordinate
                    * to start drawing and the y coordinate to start drawing.
                    * We're using our Resources helpers to refer to our images
                    * so that we get the benefits of caching these images, since
                    * we're using them over and over.
                    */
                ctx.drawImage(Resources.get(rowImages[row]), col * map.blockWidth, row * map.blockHeight);
            }
        }
    }

    // Draws the entities for the current game level
    renderEntities() {
        entities.enemies.forEach(enemy => enemy.render());
        entities.player.render();
    }

    // Currently a no-op but may be used to reset the canvas in future
    reset() {
        // noop
    }
}

// Constructing the Engine is enough to run the game (via a series of callbacks)
const engine = new Engine(map, entities);
