function Rectangle(game, settings) {
  this.game = game;
  this.center = { x: 10, y: 10 };
  this.size = { x: 30, y: 30 };
};

Rectangle.prototype = {
  update: function() {
    this.center = this.game.c.touchListener.getPosition();
    this.visible = this.game.c.touchListener.isDown();
  },

  draw: function(screen) {
    if (this.visible) {
      screen.fillStyle = "black";
      screen.fillRect(this.center.x - this.size.x / 2,
                      this.center.y - this.size.y / 2,
                      this.size.x,
                      this.size.y);
    }
  }
};

module.exports = Rectangle;
