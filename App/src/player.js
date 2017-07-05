class Player {
  constructor(game, settings) {
    this.center = settings.center;
    this.grid = settings.grid;
  }

  update() {

  }

  draw(screen) {
    screen.fillStyle = "green";
    screen.fillRect(this.center.x - this.grid.squareSize.x / 2,
                    this.center.y - this.grid.squareSize.y / 2,
                    this.grid.squareSize.x,
                    this.grid.squareSize.y);
  }
};

module.exports = Player;
