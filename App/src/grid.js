const UniqueMap = require("./unique-map");

function Grid(game, settings) {
  this.game = game;
  this.gridSize = { x: 98, y: 98 };
  this.squares = new UniqueMap(center => `${center.x},${center.y}`);
};

Grid.prototype = {
  update: function() {
    if (this.game.c.touchListener.isDown()) {
      this.squares.set(this._currentGridSquareCenter(), true);
    }
  },

  _currentGridSquareCenter: function() {
    let touchListener = this.game.c.touchListener;
    let x = Math.floor(touchListener.getPosition().x / this.gridSize.x) *
        this.gridSize.x;
    let y = Math.floor(touchListener.getPosition().y / this.gridSize.y) *
        this.gridSize.y;

    return {
      x: x,
      y: y
    };
  },

  draw: function(screen) {
    this.squares.forEach((on, center) => {
      screen.fillStyle = "black";
      screen.fillRect(center.x,
                      center.y,
                      this.gridSize.x,
                      this.gridSize.y);
    });
  }
};

module.exports = Grid;
