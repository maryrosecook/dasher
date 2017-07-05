class Line {
  constructor() {
    this.points = [];
  }

  addWaypoint(waypoint) {
    this.points = this.points.concat(this._newPoints(waypoint));
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
}

module.exports = Line;
