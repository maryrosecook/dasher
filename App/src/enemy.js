class Enemy {
  constructor(game, settings) {
    this.center = settings.center;
    this.grid = settings.grid;
    this.lastMoved = Date.now();
  }

  update() {
    if (this.lastMoved + 1000 < Date.now()) {
      this.lastMoved = Date.now();
      this.center.x += this.grid.squareSize.x;
    }
  }

  draw(screen) {
    screen.fillStyle = "red";
    screen.fillRect(this.center.x,
                    this.center.y,
                    this.grid.squareSize.x,
                    this.grid.squareSize.y);
  }
};

module.exports = Enemy;
