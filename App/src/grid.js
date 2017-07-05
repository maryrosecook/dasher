function Grid(game, settings) {
  this.game = game;
  this.squareSize = { x: 98, y: 98 };
};

Grid.prototype = {
  pointToGridSquareCenter: function(point) {
    return {
      x: Math.floor(point.x / this.squareSize.x) * this.squareSize.x,
      y: Math.floor(point.y / this.squareSize.y) * this.squareSize.y
    };
  }
};

module.exports = Grid;
