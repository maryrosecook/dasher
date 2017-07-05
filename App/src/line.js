class Line {
  constructor(game, settings) {
    this.zindex = -10;
    this.game = game;
    this.grid = settings.grid;
    this.points = [];
  }

  addWaypoint(waypoint, playerCenter) {
    this.points = this.points.concat(
      this._newPoints(waypoint, playerCenter));
  }

  isStarted() {
    return this.points.length > 0;
  }

  lastPoint() {
    return this.points[this.points.length - 1];
  }

  _newPoints(waypoint, playerCenter) {
    if (this._isAllowed(this.lastPoint(), waypoint, playerCenter)) {
      return [waypoint];
    } else {
      return [];
    }
  }

  _isAllowed(previousPoint, newPoint, playerCenter) {
    return this._isStartingOnPlayerCenter(newPoint, playerCenter) ||
      previousPoint !== undefined &&
      (previousPoint.x === newPoint.x ||
       previousPoint.y === newPoint.y);
  }

  _isStartingOnPlayerCenter(newPoint, playerCenter) {
    return !this.isStarted() &&
      this._isEqual(newPoint, playerCenter);
  }

  _isEqual(point1, point2) {
    return point1.x === point2.x &&
      point1.y === point2.y;
  }

  update() {
  }

  draw(screen) {
    screen.fillStyle = "#A7DBD8";
    this.points.forEach((point) => {
      screen.fillRect(point.x - this.grid.squareSize.x / 2,
                        point.y - this.grid.squareSize.y / 2,
                        this.grid.squareSize.x,
                        this.grid.squareSize.y);
    });
  }
}

module.exports = Line;
