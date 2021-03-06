class Enemy {
  constructor(game, settings) {
    this.game = game;
    this.grid = settings.grid;
    this.lateral = this._lateral();
    this.center = this._spawnPoint();
    this.direction = this._direction(settings);
    this.lastMoved = Date.now();
    this.moveEvery = 100 + Math.random() * 300;
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

  _spawnPoint() {
    if (this.lateral === "horizontal") {
      return this._sample(this.grid._leftSquares());
    } else if (this.lateral === "vertical") {
      return this._sample(this.grid._topSquares());
    }
  }

  _lateral() {
    const LATERALS = ["horizontal", "vertical"];
    return this._sample(LATERALS);
  }

  _direction() {
    if (this.lateral === "horizontal") {
      return this._sample([Enemy.LEFT, Enemy.RIGHT]);
    } else if (this.lateral === "vertical") {
      return this._sample([Enemy.UP, Enemy.DOWN]);
    }
  }

  _sample(array) {
    return array[Math.floor(array.length * Math.random())];
  }

  _wrap() {
    if (this.grid.isOffLeft(this.center)) {
      this.center = this.grid.moveToOffRight(this.center);
    }

    if (this.grid.isOffRight(this.center)) {
      this.center = this.grid.moveToOffLeft(this.center);
    }

    if (this.grid.isOffTop(this.center)) {
      this.center = this.grid.moveToOffBottom(this.center);
    }

    if (this.grid.isOffBottom(this.center)) {
      this.center = this.grid.moveToOffTop(this.center);
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
