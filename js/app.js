
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
            ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
        }
    }

    update(dt) {};
}

class Enemy extends Entity {
    constructor(x, y) {
        super(x, y);
        this.sprite = 'images/enemy-bug.png';
    }
}

class Player extends Entity {
    constructor(x, y, inputs) {
        super(x, y);
        this.sprite = 'images/char-boy.png';
        this.inputs = inputs;
    }

    handleInput(key) {
        this.lastInput = key;
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
        this.lastInput = '';
    }
}

class Entities {
    constructor(inputs) {
        this.enemies = [];
        this.player = new Player(200, 200, inputs);
    }
}

const inputHandler = new InputHandler();

const entities = new Entities(inputHandler);
