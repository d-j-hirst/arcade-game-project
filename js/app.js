
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

    update() {};
}

class Enemy extends Entity {
    constructor(x, y) {
        super(x, y);
        this.sprite = 'images/enemy-bug.png';
    }
}

class Player extends Entity {
    constructor(x, y) {
        super(x, y);
        this.sprite = 'images/char-boy.png'
    }

    handleInput(keys) {}
}

class Entities {
    constructor() {
        this.enemies = [];
        this.player = new Player(200, 200);
    }
}

const entities = new Entities();

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
