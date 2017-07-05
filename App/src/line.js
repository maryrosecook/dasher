class Line {
  constructor(game, settings) {
    this.game = game;
    this.grid = settings.grid;
    this.points = [];
  }

  addWaypoint(waypoint) {
    this.points = this.points.concat(this._newPoints(waypoint));
  }

  _isStarted() {
    return this.points.length > 0;
  }

  _lastPoint() {
    return this.points[this.points.length - 1];
  }

  _newPoints(waypoint) {
    if (this._isAllowed(this._lastPoint(), waypoint)) {
      return [waypoint];
    } else {
      return [];
    }
  }

  _isAllowed(waypoint1, waypoint2) {
    return waypoint1 === undefined ||
      waypoint1.x === waypoint2.x ||
      waypoint1.y === waypoint2.y;
  }

  update() {
    if (this.game.c.inputter.touch.isDown()) {
      let touchPosition = this.game.c.inputter.touch.getPosition();
      let gridPosition = this.grid.map(touchPosition);
      this.addWaypoint(gridPosition);
    } else if (this._isStarted()) {
      this.points = [];
    }
  }

  draw(screen) {
    this.points.forEach((point) => {
      screen.fillStyle = "black";
      screen.fillRect(point.x,
                      point.y,
                      this.grid.squareSize.x,
                      this.grid.squareSize.y);
    });

  }
}

module.exports = Line;
