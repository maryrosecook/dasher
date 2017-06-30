function Grid(game, settings) {
  this.game = game;
  this.gridSize = { x: 40, y: 40 };
  this.activeGridSquareCenter = undefined;
};

Grid.prototype = {
  update: function() {
    if (this.game.c.touchListener.isDown()) {
      this.activeGridSquareCenter = this._currentGridSquareCenter();
    } else {
      this.activeGridSquareCenter = undefined;
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
    if (this.activeGridSquareCenter) {
      let pressedSquareCenter = this._currentGridSquareCenter();
      screen.fillStyle = "black";
      screen.fillRect(pressedSquareCenter.x,
                      pressedSquareCenter.y,
                      this.gridSize.x,
                      this.gridSize.y);
    }
  }
};

module.exports = Grid;
