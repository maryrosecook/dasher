function Grid(game, settings) {
  this.game = game;
  this.squareSize = { x: 98, y: 98 };
  this.columns = 10;
  this.rows = 18;
};

Grid.prototype = {
  map: function(point) {
    return {
      x: (Math.floor(point.x / this.squareSize.x) *
          this.squareSize.x)
        + this.squareSize.x / 2,
      y: (Math.floor(point.y / this.squareSize.y) *
          this.squareSize.y)
        + this.squareSize.y / 2,
    };
  },

  isOffRight: function(point) {
    return point.x > this.squareSize.x * this.columns;
  },

  isOffTop: function(point) {
    return point.y < 0;
  },

  moveToOffLeft: function(point) {
    return { x: -this.squareSize.x / 2, y: point.y };
  },

  moveToOffBottom: function(point) {
    return {
      x: point.x,
      y: (this.squareSize.y * this.rows) - this.squareSize.y / 2
    };
  },

  _topSquares: function() {
    return [...Array(this.columns).keys()]
      .map(i => { return { x: i * this.squareSize.x, y: 0 }; })
      .map(this._offsetToCenter.bind(this));
  },

  _leftSquares: function() {
    return [...Array(this.columns).keys()]
      .map(i => {
        return {
          x: 0,
          y: this.squareSize.y * this.rows
        };
      })
      .map(this._offsetToCenter.bind(this));
  },

  _offsetToCenter: function(point) {
    return {
      x: point.x + this.squareSize.x / 2,
      y: point.y + this.squareSize.y / 2
    }
  },

  center: function() {
    return {
      x: (this.squareSize.x * this.columns / 2) + this.squareSize.x / 2,
      y: (this.squareSize.y * this.rows / 2) + this.squareSize.y / 2
    };
  },

  move: function(point, change) {
    return {
      x: point.x + change.x * this.squareSize.x,
      y: point.y + change.y * this.squareSize.y
    };
  }
};

module.exports = Grid;
