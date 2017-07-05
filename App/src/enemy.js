class Enemy {
  constructor(game, settings) {
    this.game = game;
    this.center = settings.center;
    this.grid = settings.grid;
    this.direction = settings.direction;
    this.lastMoved = Date.now();
    this.moveEvery = 300 + Math.random() * 300;
  }

  update() {
    if (this.lastMoved + this.moveEvery < Date.now()) {
      this.lastMoved = Date.now();
      this.center = this.grid.move(this.center, this.direction);
    }

    this._wrap();
  }

  die() {
    this.game.c.entities.destroy(this);
  }

  _wrap() {
    if (this.grid.isOffRight(this.center)) {
      this.center = this.grid.moveToOffLeft(this.center);
    }

    if (this.grid.isOffTop(this.center)) {
      this.center = this.grid.moveToOffBottom(this.center);
    }
  }

  draw(screen) {
    screen.fillStyle = "#FA6900";
    screen.fillRect(this.center.x - this.grid.squareSize.x / 2,
                      this.center.y - this.grid.squareSize.y / 2,
                      this.grid.squareSize.x,
                      this.grid.squareSize.y);
  }
};

Enemy.UP = { x: 0, y: -1 };
Enemy.DOWN = { x: 0, y: 1 };
Enemy.LEFT = { x: -1, y: 0 };
Enemy.RIGHT = { x: 1, y: 0 };

module.exports = Enemy;
