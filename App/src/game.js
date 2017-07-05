let Coquette = require("./coquette");
let TouchListener = require("./touch-listener");
const Rectangle = require("./rectangle");
const Grid = require("./grid");

const CANVAS_SELECTOR_ID = "canvas";

function Game() {
  let coquette = new Coquette(this, CANVAS_SELECTOR_ID, 400, 400, "white");
  let canvas = document.getElementById(CANVAS_SELECTOR_ID);
  coquette.touchListener = new TouchListener(canvas);
  this.c = coquette;

  // let rectangle = coquette.entities.create(Rectangle);
  let grid = coquette.entities.create(Grid);
};

Game.prototype.update = function() {

};



new Game();
