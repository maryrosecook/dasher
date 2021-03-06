const Player = require("./player");
const Coquette = require("./coquette");
const TouchListener = require("./touch-listener");
const Rectangle = require("./rectangle");
const Grid = require("./grid");
const Enemy = require("./enemy");

const CANVAS_SELECTOR_ID = "canvas";

function Game() {
  let canvas = document.getElementById(CANVAS_SELECTOR_ID);
  this.c = new Coquette(this,
                        CANVAS_SELECTOR_ID,
                        window.innerWidth,
                        window.innerHeight,
                        "white");
  let grid = new Grid();
  this.player = this.c.entities.create(Player, {
    grid: grid,
    center: grid.map({ x: 300, y: 300 })
  });

  this._addEnemies(grid);
};

Game.prototype = {
  update: function() {
    this.player.handleCollisions();
  },

  _addEnemies: function(grid) {
    this.c.entities.create(Enemy, {
      center: grid.map({ x: 100, y: 100 }),
      grid: grid,
      direction: Enemy.RIGHT
    });

    this.c.entities.create(Enemy, {
      center: grid.map({ x: 100, y: 300 }),
      grid: grid,
      direction: Enemy.UP
    });

    this.c.entities.create(Enemy, {
      center: grid.map({ x: 400, y: 700 }),
      grid: grid,
      direction: Enemy.UP
    });

    this.c.entities.create(Enemy, {
      center: grid.map({ x: 900, y: 1700 }),
      grid: grid,
      direction: Enemy.UP
    });
  }
};




new Game();
