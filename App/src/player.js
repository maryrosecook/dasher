const Line = require("./line");

class Player {
  constructor(game, settings) {
    this.game = game;
    this.center = settings.center;
    this.grid = settings.grid;
    this.line = this.game.c.entities.create(Line, { grid: this.grid });
  }

  update() {
    if (this.game.c.inputter.touch.isDown()) {
      let touchPosition = this.game.c.inputter.touch.getPosition();
      let gridPosition = this.grid.map(touchPosition);
      this.line.addWaypoint(gridPosition, this.center);
      if (this.line.isStarted()) {
        this.center = this.line.lastPoint();
      }
    } else {
      this.line.points = [];
    }
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
