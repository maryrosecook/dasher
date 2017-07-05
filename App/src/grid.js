const Line = require("./line");
const UniqueMap = require("./unique-map");

function Grid(game, settings) {
  this.game = game;
  this.gridSize = { x: 98, y: 98 };
  this.line = new Line();
};

Grid.prototype = {
  update: function() {
    if (this.game.c.inputter.touch.isDown()) {
      this.line.addWaypoint(this._currentGridSquareCenter());
    }
  },

  _currentGridSquareCenter: function() {
    let touchListener = this.game.c.inputter.touch;
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
    this.line.points.forEach((point) => {
      screen.fillStyle = "black";
      screen.fillRect(point.x,
                      point.y,
                      this.gridSize.x,
                      this.gridSize.y);
    });
  }
};

module.exports = Grid;
