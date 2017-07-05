function Grid(game, settings) {
  this.game = game;
  this.squareSize = { x: 98, y: 98 };
  this.columns = 10;
};

Grid.prototype = {
  map: function(point) {
    return {
      x: Math.floor(point.x / this.squareSize.x) * this.squareSize.x,
      y: Math.floor(point.y / this.squareSize.y) * this.squareSize.y
    };
  },

  moveToOffLeft: function(point) {
    return { x: -this.squareSize.x / 2, y: point.y };
  },

  isOffRight: function(point) {
    return point.x > this.squareSize.x * this.columns;
  },

  move: function(point, change) {
    return {
      x: point.x + change.x * this.squareSize.x,
      y: point.y + change.y * this.squareSize.y
    };
  }
};

module.exports = Grid;
