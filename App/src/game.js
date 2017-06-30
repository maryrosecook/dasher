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


// Align rectangles drawn for finger touches to a grid
// refactor
// draw rectangle when tap
// only draw rectangle when finger down
// draw rectangle at finger position
// console.log position on pan
// find out how to make mouse position update immeditatyl on tap down
// console.log() on tap
// console.log() on rectangle update
// draw rectangle all the time
// get rectangle printing go on draw
// find out what's printing go
// get touch listener console.logging on taps
