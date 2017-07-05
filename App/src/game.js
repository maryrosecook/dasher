let Coquette = require("./coquette");
let TouchListener = require("./touch-listener");
const Rectangle = require("./rectangle");
const Grid = require("./grid");

const CANVAS_SELECTOR_ID = "canvas";

function Game() {
  let canvas = document.getElementById(CANVAS_SELECTOR_ID);
  this.c = new Coquette(this,
                        CANVAS_SELECTOR_ID,
                        window.innerWidth,
                        window.innerHeight,
                        "white");
  this.c.entities.create(Grid);
};

Game.prototype = {
  update: function() {

  }
};



new Game();
