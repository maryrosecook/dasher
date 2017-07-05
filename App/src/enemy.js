class Enemy {
  constructor(game, settings) {
    this.center = settings.center;
    this.grid = settings.grid;
  }

  update() {

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
