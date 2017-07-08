const gridCollider = require("./grid-collider");
const Line = require("./line");
const Enemy = require("./enemy");

class Player {
  constructor(game, settings) {
    this.game = game;
    this.grid = settings.grid;
    this.center = this.grid.center();
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

  handleCollisions() {
    this.dieIfHitEnemyWhenNotCharged(
      this.game.c.entities.all(Enemy));
    this.handlePlayerCollisionsWithEnemies(
      this.game.c.entities.all(Enemy));
    this.handleLineCollisionsWithEnemies(
      this.game.c.entities.all(Enemy));
  }

  dieIfHitEnemyWhenNotCharged(enemies) {
    if (!this._isCharged() &&
        this._enemiesCollidingWith(enemies).length > 0) {
      this.die();
    }
  }

  handlePlayerCollisionsWithEnemies(enemies) {
    this._enemiesCollidingWith(enemies)
      .forEach(enemy => enemy.die());
  }

  _enemiesCollidingWith(enemies) {
    return enemies
      .filter(enemy =>
              gridCollider.isColliding(this.center, enemy.center));
  }

  _isCharged() {
    const MIN_CHARGE_LINE_LENGTH = 5;
    return this.line.size() >= MIN_CHARGE_LINE_LENGTH;
  }

  handleLineCollisionsWithEnemies(enemies) {
    if (this.isLineCollidingWithAnyEnemies(enemies)) {
      this.die();
    }
  }

  die() {
    this.game.c.entities.destroy(this.line);
    this.game.c.entities.destroy(this);
  }

  isLineCollidingWithAnyEnemies(enemies) {
    return enemies
      .filter(enemy => this.line.isCollidingWith(enemy.center))
      .length > 0;
  }

  draw(screen) {
    let color = this._isCharged() ? "#A7DBD8" : "#E0E4CC";
    screen.fillStyle = color;
    screen.fillRect(this.center.x - this.grid.squareSize.x / 2,
                    this.center.y - this.grid.squareSize.y / 2,
                    this.grid.squareSize.x,
                    this.grid.squareSize.y);
  }
};

module.exports = Player;
