const UniqueMap = require("./unique-map");
const gridCollider = require("./grid-collider");

class Line {
  constructor(game, settings) {
    this.zindex = -10;
    this.game = game;
    this.grid = settings.grid;
    this.pointsMap = new UniqueMap((point) => `${point.x},${point.y}`);
  }

  addWaypoint(waypoint, playerCenter) {
    let newPoints = this._newPoints(waypoint, playerCenter);
    newPoints.forEach((point) => {
      this.pointsMap.set(point, true);
    });

    return newPoints.length > 0;
  }

  clear() {
    this.pointsMap.clear();
  }

  size() {
    return this.pointsMap.size;
  }

  isCollidingWith(center) {
    return Array.from(this.pointsMap.keys())
      .filter(point => gridCollider.isColliding(point, center))
      .length > 0;
  }

  isStarted() {
    return this.pointsMap.size > 0;
  }

  lastPoint() {
    return Array.from(this.pointsMap.keys())[this.pointsMap.size - 1];
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
    screen.fillStyle = "#E0E4CC";
    this.pointsMap.forEach((_, point) => {
      screen.fillRect(point.x - this.grid.squareSize.x / 2,
                      point.y - this.grid.squareSize.y / 2,
                      this.grid.squareSize.x,
                      this.grid.squareSize.y);
    });
  }
}

module.exports = Line;
