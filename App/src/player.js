const gridCollider = require("./grid-collider");
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
      let werePointsAdded = this.line.addWaypoint(gridPosition,
                                                  this.center);
      if (werePointsAdded) {
        this.center = this.line.lastPoint();
      }
    } else {
      this.line.clear();
    }
  }

  handleCollisions(enemies) {
    enemies
      .filter(enemy => gridCollider.isColliding(this, enemy))
      .forEach(enemy => {
        this.game.c.entities.destroy(enemy);
      });
  }

  draw(screen) {
    screen.fillStyle = "#69D2E7";
    screen.fillRect(this.center.x - this.grid.squareSize.x / 2,
                    this.center.y - this.grid.squareSize.y / 2,
                    this.grid.squareSize.x,
                    this.grid.squareSize.y);
  }
};

module.exports = Player;
