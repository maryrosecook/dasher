let Hammer = require("./hammer.min");

function TouchListener(canvas) {
  let hammer = this._setupHammer(canvas);
  this._monitorDown(hammer);
  this._monitorPosition(hammer);
};

TouchListener.prototype = {
  _setupHammer: function(canvas) {
    let hammer = new Hammer(canvas, {});
    let pan = new Hammer.Pan({ threshold: 0 });
    let press = new Hammer.Press({ time: 0 });
    hammer.add(pan);
    hammer.add(press);
    return hammer;
  },

  _monitorPosition: function(hammer) {
    this.position = {};

    hammer.on('press', (e) => {
      this.position.x = e.center.x;
      this.position.y = e.center.y;
    });

    hammer.on('pan', (e) => {
      this.position.x = e.center.x;
      this.position.y = e.center.y;
    });
  },

  _monitorDown: function(hammer) {
    this.down = false;

    hammer.on('press', (e) => this.down = true);
    hammer.on('pan', (e) => this.down = true);

    hammer.on('pressup', (e) => this.down = false);
    hammer.on('tap', (e) => this.down = false);
    hammer.on('panend', (e) => this.down = false);
  },

  getPosition: function() {
    return {
      x: this.position.x,
      y: this.position.y
    };
  },

  isDown: function() {
    return this.down === true;
  }
};

module.exports = TouchListener;
