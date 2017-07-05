/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 4);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

var Coquette = function(game, canvasId, width, height, backgroundColor, autoFocus) {
  var canvas = document.getElementById(canvasId);
  this.renderer = new Renderer(this, game, canvas, width, height, backgroundColor);
  this.inputter = new Inputter(this, canvas, autoFocus);
  this.entities = new Entities(this, game);
  this.runner = new Runner(this);
  this.collider = new Collider(this);

  var self = this;
  this.ticker = new Ticker(this, function(interval) {
    self.runner.update(interval);
    if (game.update !== undefined) {
      game.update(interval);
    }

    self.entities.update(interval)
    self.collider.update(interval);
    self.renderer.update(interval);
    self.inputter.update();
  });
};

module.exports = Coquette;

var Collider = function(coquette) {
  this.c = coquette;
};

var isSetupForCollisions = function(obj) {
  return obj.center !== undefined && obj.size !== undefined;
};

Collider.prototype = {
  _currentCollisionPairs: [],

  update: function() {
    this._currentCollisionPairs = [];

    // get all entity pairs to test for collision
    var ent = this.c.entities.all();
    for (var i = 0, len = ent.length; i < len; i++) {
      for (var j = i + 1; j < len; j++) {
        this._currentCollisionPairs.push([ent[i], ent[j]]);
      }
    }

    // test collisions
    while (this._currentCollisionPairs.length > 0) {
      var pair = this._currentCollisionPairs.shift();
      if (this.isColliding(pair[0], pair[1])) {
        this.collision(pair[0], pair[1]);
      }
    }
  },

  collision: function(entity1, entity2) {
    notifyEntityOfCollision(entity1, entity2);
    notifyEntityOfCollision(entity2, entity1);
  },

  createEntity: function(entity) {
    var ent = this.c.entities.all();
    for (var i = 0, len = ent.length; i < len; i++) {
      if (ent[i] !== entity) { // decouple from when c.entities adds to _entities
        this._currentCollisionPairs.push([ent[i], entity]);
      }
    }
  },

  destroyEntity: function(entity) {
    // if coll detection happening, remove any pairs that include entity
    for(var i = this._currentCollisionPairs.length - 1; i >= 0; i--){
      if (this._currentCollisionPairs[i][0] === entity ||
          this._currentCollisionPairs[i][1] === entity) {
        this._currentCollisionPairs.splice(i, 1);
      }
    }
  },

  isColliding: function(obj1, obj2) {
    return obj1 !== obj2 &&
      isSetupForCollisions(obj1) &&
      isSetupForCollisions(obj2) &&
      this.isIntersecting(obj1, obj2);
  },

  isIntersecting: function(obj1, obj2) {
    var obj1BoundingBox = getBoundingBox(obj1);
    var obj2BoundingBox = getBoundingBox(obj2);

    if (obj1BoundingBox === this.RECTANGLE && obj2BoundingBox === this.RECTANGLE) {
      return Maths.rectanglesIntersecting(obj1, obj2);
    } else if (obj1BoundingBox === this.CIRCLE && obj2BoundingBox === this.RECTANGLE) {
      return Maths.circleAndRectangleIntersecting(obj1, obj2);
    } else if (obj1BoundingBox === this.RECTANGLE && obj2BoundingBox === this.CIRCLE) {
      return Maths.circleAndRectangleIntersecting(obj2, obj1);
    } else if (obj1BoundingBox === this.CIRCLE && obj2BoundingBox === this.CIRCLE) {
      return Maths.circlesIntersecting(obj1, obj2);
    } else {
      throw "Objects being collision tested have unsupported bounding box types."
    }
  },

  RECTANGLE: 0,
  CIRCLE: 1
};

var getBoundingBox = function(obj) {
  return obj.boundingBox || Collider.prototype.RECTANGLE;
};

var notifyEntityOfCollision = function(entity, other) {
  if (entity.collision !== undefined) {
    entity.collision(other);
  }
};

var rotated = function(obj) {
  return obj.angle !== undefined && obj.angle !== 0;
};

var getAngle = function(obj) {
  return obj.angle === undefined ? 0 : obj.angle;
};

var Maths = {
  circlesIntersecting: function(obj1, obj2) {
    return Maths.distance(obj1.center, obj2.center) <
      obj1.size.x / 2 + obj2.size.x / 2;
  },

  rectanglesIntersecting: function(obj1, obj2) {
    if (!rotated(obj1) && !rotated(obj2)) {
      return this.unrotatedRectanglesIntersecting(obj1, obj2); // faster
    } else {
      return this.rotatedRectanglesIntersecting(obj1, obj2); // slower
    }
  },

  circleAndRectangleIntersecting: function(circleObj, rectangleObj) {
    var rectangleObjAngleRad = -getAngle(rectangleObj) * Maths.RADIANS_TO_DEGREES;

    var unrotatedCircleCenter = {
      x: Math.cos(rectangleObjAngleRad) *
        (circleObj.center.x - rectangleObj.center.x) -
        Math.sin(rectangleObjAngleRad) *
        (circleObj.center.y - rectangleObj.center.y) + rectangleObj.center.x,
      y: Math.sin(rectangleObjAngleRad) *
        (circleObj.center.x - rectangleObj.center.x) +
        Math.cos(rectangleObjAngleRad) *
        (circleObj.center.y - rectangleObj.center.y) + rectangleObj.center.y
    };

    var closest = { x: 0, y: 0 };

    if (unrotatedCircleCenter.x < rectangleObj.center.x - rectangleObj.size.x / 2) {
      closest.x = rectangleObj.center.x - rectangleObj.size.x / 2;
    } else if (unrotatedCircleCenter.x > rectangleObj.center.x + rectangleObj.size.x / 2) {
      closest.x = rectangleObj.center.x + rectangleObj.size.x / 2;
    } else {
      closest.x = unrotatedCircleCenter.x;
    }

    if (unrotatedCircleCenter.y < rectangleObj.center.y - rectangleObj.size.y / 2) {
      closest.y = rectangleObj.center.y - rectangleObj.size.y / 2;
    } else if (unrotatedCircleCenter.y > rectangleObj.center.y + rectangleObj.size.y / 2) {
      closest.y = rectangleObj.center.y + rectangleObj.size.y / 2;
    } else {
      closest.y = unrotatedCircleCenter.y;
    }

    return this.distance(unrotatedCircleCenter, closest) < circleObj.size.x / 2;
  },

  unrotatedRectanglesIntersecting: function(obj1, obj2) {
    if(obj1.center.x + obj1.size.x / 2 < obj2.center.x - obj2.size.x / 2) {
      return false;
    } else if(obj1.center.x - obj1.size.x / 2 > obj2.center.x + obj2.size.x / 2) {
      return false;
    } else if(obj1.center.y - obj1.size.y / 2 > obj2.center.y + obj2.size.y / 2) {
      return false;
    } else if(obj1.center.y + obj1.size.y / 2 < obj2.center.y - obj2.size.y / 2) {
      return false
    } else {
      return true;
    }
  },

  rotatedRectanglesIntersecting: function(obj1, obj2) {
    var obj1Normals = this.rectanglePerpendicularNormals(obj1);
    var obj2Normals = this.rectanglePerpendicularNormals(obj2);

    var obj1Corners = this.rectangleCorners(obj1);
    var obj2Corners = this.rectangleCorners(obj2);

    if (this.projectionsSeparate(
      this.getMinMaxProjection(obj1Corners, obj1Normals[1]),
      this.getMinMaxProjection(obj2Corners, obj1Normals[1]))) {
      return false;
    } else if (this.projectionsSeparate(
      this.getMinMaxProjection(obj1Corners, obj1Normals[0]),
      this.getMinMaxProjection(obj2Corners, obj1Normals[0]))) {
      return false;
    } else if (this.projectionsSeparate(
      this.getMinMaxProjection(obj1Corners, obj2Normals[1]),
      this.getMinMaxProjection(obj2Corners, obj2Normals[1]))) {
      return false;
    } else if (this.projectionsSeparate(
      this.getMinMaxProjection(obj1Corners, obj2Normals[0]),
      this.getMinMaxProjection(obj2Corners, obj2Normals[0]))) {
      return false;
    } else {
      return true;
    }
  },

  pointInsideObj: function(point, obj) {
    var objBoundingBox = getBoundingBox(obj);

    if (objBoundingBox === Collider.prototype.RECTANGLE) {
      return this.pointInsideRectangle(point, obj);
    } else if (objBoundingBox === Collider.prototype.CIRCLE) {
      return this.pointInsideCircle(point, obj);
    } else {
      throw "Tried to see if point inside object with unsupported bounding box.";
    }
  },

  pointInsideRectangle: function(point, obj) {
    var c = Math.cos(-getAngle(obj) * Maths.RADIANS_TO_DEGREES);
    var s = Math.sin(-getAngle(obj) * Maths.RADIANS_TO_DEGREES);

    var rotatedX = obj.center.x + c *
        (point.x - obj.center.x) - s * (point.y - obj.center.y);
    var rotatedY = obj.center.y + s *
        (point.x - obj.center.x) + c * (point.y - obj.center.y);

    var leftX = obj.center.x - obj.size.x / 2;
    var rightX = obj.center.x + obj.size.x / 2;
    var topY = obj.center.y - obj.size.y / 2;
    var bottomY = obj.center.y + obj.size.y / 2;

    return leftX <= rotatedX && rotatedX <= rightX &&
      topY <= rotatedY && rotatedY <= bottomY;
  },

  pointInsideCircle: function(point, obj) {
    return this.distance(point, obj.center) <= obj.size.x / 2;
  },

  distance: function(point1, point2) {
    var x = point1.x - point2.x;
    var y = point1.y - point2.y;
    return Math.sqrt((x * x) + (y * y));
  },

  vectorTo: function(start, end) {
    return {
      x: end.x - start.x,
      y: end.y - start.y
    };
  },

  magnitude: function(vector) {
    return Math.sqrt(vector.x * vector.x + vector.y * vector.y);
  },

  leftNormalizedNormal: function(vector) {
    return {
      x: -vector.y,
      y: vector.x
    };
  },

  dotProduct: function(vector1, vector2) {
    return vector1.x * vector2.x + vector1.y * vector2.y;
  },

  unitVector: function(vector) {
    return {
      x: vector.x / Maths.magnitude(vector),
      y: vector.y / Maths.magnitude(vector)
    };
  },

  projectionsSeparate: function(proj1, proj2) {
    return proj1.max < proj2.min || proj2.max < proj1.min;
  },

  getMinMaxProjection: function(objCorners, normal) {
    var min = Maths.dotProduct(objCorners[0], normal);
    var max = Maths.dotProduct(objCorners[0], normal);

    for (var i = 1; i < objCorners.length; i++) {
      var current = Maths.dotProduct(objCorners[i], normal);
      if (min > current) {
        min = current;
      }

      if (current > max) {
        max = current;
      }
    }

    return { min: min, max: max };
  },

  rectangleCorners: function(obj) {
    var corners = [ // unrotated
      { x:obj.center.x - obj.size.x / 2, y: obj.center.y - obj.size.y / 2 },
      { x:obj.center.x + obj.size.x / 2, y: obj.center.y - obj.size.y / 2 },
      { x:obj.center.x + obj.size.x / 2, y: obj.center.y + obj.size.y / 2 },
      { x:obj.center.x - obj.size.x / 2, y: obj.center.y + obj.size.y / 2 }
    ];

    var angle = getAngle(obj) * Maths.RADIANS_TO_DEGREES;

		for (var i = 0; i < corners.length; i++) {
			var xOffset = corners[i].x - obj.center.x;
			var yOffset = corners[i].y - obj.center.y;
			corners[i].x = obj.center.x +
        xOffset * Math.cos(angle) - yOffset * Math.sin(angle);
			corners[i].y = obj.center.y +
        xOffset * Math.sin(angle) + yOffset * Math.cos(angle);
		}

    return corners;
  },

  rectangleSideVectors: function(obj) {
    var corners = this.rectangleCorners(obj);
    return [
      { x: corners[0].x - corners[1].x, y: corners[0].y - corners[1].y },
      { x: corners[1].x - corners[2].x, y: corners[1].y - corners[2].y },
      { x: corners[2].x - corners[3].x, y: corners[2].y - corners[3].y },
      { x: corners[3].x - corners[0].x, y: corners[3].y - corners[0].y }
    ];
  },

  rectanglePerpendicularNormals: function(obj) {
    var sides = this.rectangleSideVectors(obj);
    return [
      Maths.leftNormalizedNormal(sides[0]),
      Maths.leftNormalizedNormal(sides[1])
    ];
  },

  RADIANS_TO_DEGREES: 0.01745
};


var Inputter = function(coquette, canvas, autoFocus) {
  var keyboardReceiver = autoFocus === false ? canvas : window;
  connectReceiverToKeyboard(keyboardReceiver, window, autoFocus);

  this._buttonListener = new ButtonListener(canvas, keyboardReceiver);
  this._mouseMoveListener = new MouseMoveListener(canvas);
};

Inputter.prototype = {
  update: function() {
    this._buttonListener.update();
  },

  // Returns true if passed button currently down
  isDown: function(button) {
    return this._buttonListener.isDown(button);
  },

  // Returns true if passed button just gone down. true once per keypress.
  isPressed: function(button) {
    return this._buttonListener.isPressed(button);
  },

  getMousePosition: function() {
    return this._mouseMoveListener.getMousePosition();
  },

  // Returns true if passed button currently down
  bindMouseMove: function(fn) {
    return this._mouseMoveListener.bind(fn);
  },

  // Stops calling passed fn on mouse move
  unbindMouseMove: function(fn) {
    return this._mouseMoveListener.unbind(fn);
  },

  LEFT_MOUSE: "LEFT_MOUSE",
  RIGHT_MOUSE: "RIGHT_MOUSE",

  BACKSPACE: 8,
  TAB: 9,
  ENTER: 13,
  SHIFT: 16,
  CTRL: 17,
  ALT: 18,
  PAUSE: 19,
  CAPS_LOCK: 20,
  ESC: 27,
  SPACE: 32,
  PAGE_UP: 33,
  PAGE_DOWN: 34,
  END: 35,
  HOME: 36,
  LEFT_ARROW: 37,
  UP_ARROW: 38,
  RIGHT_ARROW: 39,
  DOWN_ARROW: 40,
  INSERT: 45,
  DELETE: 46,
  ZERO: 48,
  ONE: 49,
  TWO: 50,
  THREE: 51,
  FOUR: 52,
  FIVE: 53,
  SIX: 54,
  SEVEN: 55,
  EIGHT: 56,
  NINE: 57,
  A: 65,
  B: 66,
  C: 67,
  D: 68,
  E: 69,
  F: 70,
  G: 71,
  H: 72,
  I: 73,
  J: 74,
  K: 75,
  L: 76,
  M: 77,
  N: 78,
  O: 79,
  P: 80,
  Q: 81,
  R: 82,
  S: 83,
  T: 84,
  U: 85,
  V: 86,
  W: 87,
  X: 88,
  Y: 89,
  Z: 90,
  F1: 112,
  F2: 113,
  F3: 114,
  F4: 115,
  F5: 116,
  F6: 117,
  F7: 118,
  F8: 119,
  F9: 120,
  F10: 121,
  F11: 122,
  F12: 123,
  NUM_LOCK: 144,
  SCROLL_LOCK: 145,
  SEMI_COLON: 186,
  EQUALS: 187,
  COMMA: 188,
  DASH: 189,
  PERIOD: 190,
  FORWARD_SLASH: 191,
  GRAVE_ACCENT: 192,
  OPEN_SQUARE_BRACKET: 219,
  BACK_SLASH: 220,
  CLOSE_SQUARE_BRACKET: 221,
  SINGLE_QUOTE: 222
};

var ButtonListener = function(canvas, keyboardReceiver) {
  var self = this;
  this._buttonDownState = {};
  this._buttonPressedState = {};

  keyboardReceiver.addEventListener('keydown', function(e) {
    self._down(e.keyCode);
  }, false);

  keyboardReceiver.addEventListener('keyup', function(e) {
    self._up(e.keyCode);
  }, false);

  canvas.addEventListener('mousedown', function(e) {
    self._down(self._getMouseButton(e));
  }, false);

  canvas.addEventListener('mouseup', function(e) {
    self._up(self._getMouseButton(e));
  }, false);
};

ButtonListener.prototype = {
  update: function() {
    for (var i in this._buttonPressedState) {
      if (this._buttonPressedState[i] === true) { // tick passed and press event in progress
        this._buttonPressedState[i] = false; // end key press
      }
    }
  },

  _down: function(buttonId) {
    this._buttonDownState[buttonId] = true;
    if (this._buttonPressedState[buttonId] === undefined) { // start of new keypress
      this._buttonPressedState[buttonId] = true; // register keypress in progress
    }
  },

  _up: function(buttonId) {
    this._buttonDownState[buttonId] = false;
    if (this._buttonPressedState[buttonId] === false) { // prev keypress over
      this._buttonPressedState[buttonId] = undefined; // prep for keydown to start next press
    }
  },

  isDown: function(button) {
    return this._buttonDownState[button] || false;
  },

  isPressed: function(button) {
    return this._buttonPressedState[button] || false;
  },

  _getMouseButton: function(e) {
    if (e.which !== undefined || e.button !== undefined) {
      if (e.which === 3 || e.button === 2) {
        return Inputter.prototype.RIGHT_MOUSE;
      } else if (e.which === 1 || e.button === 0 || e.button === 1) {
        return Inputter.prototype.LEFT_MOUSE;
      }
    }

    throw "Cannot judge button pressed on passed mouse button event";
  }
};

var MouseMoveListener = function(canvas) {
  this._bindings = [];
  this._mousePosition;
  var self = this;

  canvas.addEventListener('mousemove', function(e) {
    var absoluteMousePosition = self._getAbsoluteMousePosition(e);
    var elementPosition = getElementPosition(canvas);
    self._mousePosition = {
      x: absoluteMousePosition.x - elementPosition.x,
      y: absoluteMousePosition.y - elementPosition.y
    };
  }, false);

  canvas.addEventListener('mousemove', function(e) {
    for (var i = 0; i < self._bindings.length; i++) {
      self._bindings[i](self.getMousePosition());
    }
  }, false);
};

MouseMoveListener.prototype = {
  bind: function(fn) {
    this._bindings.push(fn);
  },

  unbind: function(fn) {
    for (var i = 0; i < this._bindings.length; i++) {
      if (this._bindings[i] === fn) {
        this._bindings.splice(i, 1);
        return;
      }
    }

    throw "Function to unbind from mouse moves was never bound";
  },

  getMousePosition: function() {
    return this._mousePosition;
  },

  _getAbsoluteMousePosition: function(e) {
	  if (e.pageX !== undefined) 	{
      return { x: e.pageX, y: e.pageY };
	  } else if (e.clientX !== undefined) {
      return { x: e.clientX, y: e.clientY };
    }
  }
};

var getWindow = function(document) {
  return document.parentWindow || document.defaultView;
};

var getElementPosition = function(element) {
  var rect = element.getBoundingClientRect();
  var document = element.ownerDocument;
  var body = document.body;
  var window = getWindow(document);
  return {
    x: rect.left + (window.pageXOffset || body.scrollLeft) - (body.clientLeft || 0),
    y: rect.top + (window.pageYOffset || body.scrollTop) - (body.clientTop || 0)
  };
};

var connectReceiverToKeyboard = function(keyboardReceiver, window, autoFocus) {
  if (autoFocus === false) {
    keyboardReceiver.contentEditable = true; // lets canvas get focus and get key events
  } else {
    var suppressedKeys = [
      Inputter.prototype.SPACE,
      Inputter.prototype.LEFT_ARROW,
      Inputter.prototype.UP_ARROW,
      Inputter.prototype.RIGHT_ARROW,
      Inputter.prototype.DOWN_ARROW
    ];

    // suppress scrolling
    window.addEventListener("keydown", function(e) {
      for (var i = 0; i < suppressedKeys.length; i++) {
        if(suppressedKeys[i] === e.keyCode) {
          e.preventDefault();
          return;
        }
      }
    }, false);
  }
};

function Runner(coquette) {
  this.c = coquette;
  this._runs = [];
};

Runner.prototype = {
  update: function() {
    this.run();
  },

  run: function() {
    while(this._runs.length > 0) {
      var run = this._runs.shift();
      run.fn(run.obj);
    }
  },

  add: function(obj, fn) {
    this._runs.push({
      obj: obj,
      fn: fn
    });
  }
};

var interval = 16;

function Ticker(coquette, gameLoop) {
  setupRequestAnimationFrame();

  var nextTickFn;
  this.stop = function() {
    nextTickFn = function() {};
  };

  this.start = function() {
    var prev = Date.now();
    var tick = function() {
      var now = Date.now();
      var interval = now - prev;
      prev = now;
      gameLoop(interval);
      requestAnimationFrame(nextTickFn);
    };

    nextTickFn = tick;
    requestAnimationFrame(nextTickFn);
  };

  this.start();
};

// From: https://gist.github.com/paulirish/1579671
// Thanks Erik, Paul and Tino
var setupRequestAnimationFrame = function() {
  var lastTime = 0;
  var vendors = ['ms', 'moz', 'webkit', 'o'];
  for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
    window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
      || window[vendors[x]+'CancelRequestAnimationFrame'];
  }

  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function(callback, element) {
      var currTime = Date.now();
      var timeToCall = Math.max(0, interval - (currTime - lastTime));
      var id = window.setTimeout(function() { callback(currTime + timeToCall); },
                                 timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };
  }

  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function(id) {
      clearTimeout(id);
    };
  }
};

var Renderer = function(coquette, game, canvas, wView, hView, backgroundColor) {
  this.c = coquette;
  this.game = game;
  canvas.style.outline = "none"; // stop browser outlining canvas when it has focus
  canvas.style.cursor = "default"; // keep pointer normal when hovering over canvas
  this._ctx = canvas.getContext('2d');
  this._backgroundColor = backgroundColor;

  canvas.width = wView;
  canvas.height = hView;
  this._viewSize = { x:wView, y:hView };
  this._viewCenter = { x: this._viewSize.x / 2, y: this._viewSize.y / 2 };
};

Renderer.prototype = {
  getCtx: function() {
    return this._ctx;
  },

  getViewSize: function() {
    return this._viewSize;
  },

  getViewCenter: function() {
    return this._viewCenter;
  },

  setViewCenter: function(pos) {
    this._viewCenter = { x:pos.x, y:pos.y };
  },

  setBackground: function(color) {
    this._backgroundColor = color;
  },

  update: function(interval) {
    var ctx = this.getCtx();
    var viewTranslate = viewOffset(this._viewCenter, this._viewSize);

    ctx.translate(viewTranslate.x, viewTranslate.y);

    // draw background
    var viewArgs = [
      this._viewCenter.x - this._viewSize.x / 2,
      this._viewCenter.y - this._viewSize.y / 2,
      this._viewSize.x,
      this._viewSize.y
    ]
    if (this._backgroundColor !== undefined) {
      ctx.fillStyle = this._backgroundColor;
      ctx.fillRect.apply(ctx, viewArgs);
    } else {
      ctx.clearRect.apply(ctx, viewArgs);
    }

    // draw game and entities
    var drawables = [this.game]
        .concat(this.c.entities.all().sort(zindexSort));
    for (var i = 0, len = drawables.length; i < len; i++) {
      if (drawables[i].draw !== undefined) {
        var drawable = drawables[i];

        ctx.save();

        if (drawable.center !== undefined && drawable.angle !== undefined) {
          ctx.translate(drawable.center.x, drawable.center.y);
          ctx.rotate(drawable.angle * Maths.RADIANS_TO_DEGREES);
          ctx.translate(-drawable.center.x, -drawable.center.y);
        }

        drawables[i].draw(ctx);

        ctx.restore();
      }
    }

    ctx.translate(-viewTranslate.x, -viewTranslate.y);
  },

  onScreen: function(obj) {
    return Maths.rectanglesIntersecting(obj, {
      size: this._viewSize,
      center: {
        x: this._viewCenter.x,
        y: this._viewCenter.y
      }
    });
  }
};

var viewOffset = function(viewCenter, viewSize) {
  return {
    x: -(viewCenter.x - viewSize.x / 2),
    y: -(viewCenter.y - viewSize.y / 2)
  }
};

// sorts passed array by zindex
// elements with a higher zindex are drawn on top of those with a lower zindex
var zindexSort = function(a, b) {
  return (a.zindex || 0) < (b.zindex || 0) ? -1 : 1;
};

function Entities(coquette, game) {
  this.c = coquette;
  this.game = game;
  this._entities = [];
};

Entities.prototype = {
  update: function(interval) {
    var entities = this.all();
    for (var i = 0, len = entities.length; i < len; i++) {
      if (entities[i].update !== undefined) {
        entities[i].update(interval);
      }
    }
  },

  all: function(Constructor) {
    if (Constructor === undefined) {
      return this._entities.slice(); // return shallow copy of array
    } else {
      var entities = [];
      for (var i = 0; i < this._entities.length; i++) {
        if (this._entities[i] instanceof Constructor) {
          entities.push(this._entities[i]);
        }
      }

      return entities;
    }
  },

  create: function(Constructor, settings) {
    var entity = new Constructor(this.game, settings || {});
    this.c.collider.createEntity(entity);
    this._entities.push(entity);
    return entity;
  },

  destroy: function(entity) {
    for(var i = 0; i < this._entities.length; i++) {
      if(this._entities[i] === entity) {
        this.c.collider.destroyEntity(entity);
        this._entities.splice(i, 1);
        break;
      }
    }
  }
};


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

const UniqueMap = __webpack_require__(6);

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


/***/ }),
/* 2 */
/***/ (function(module, exports) {

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


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

let Hammer = __webpack_require__(5);

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


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

let Coquette = __webpack_require__(0);
let TouchListener = __webpack_require__(3);
const Rectangle = __webpack_require__(2);
const Grid = __webpack_require__(1);

const CANVAS_SELECTOR_ID = "canvas";

function Game() {
  let canvas = document.getElementById(CANVAS_SELECTOR_ID);
  this.c = new Coquette(this,
                        CANVAS_SELECTOR_ID,
                        window.innerWidth,
                        window.innerHeight,
                        "white");

  this._addTouchListenerToCoquette(this.c, canvas);
  let grid = this.c.entities.create(Grid);
};

Game.prototype = {
  update: function() {

  },

  _addTouchListenerToCoquette: function(coquette, canvas) {
    coquette.touchListener = new TouchListener(canvas);
  }
};



new Game();


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_RESULT__;/*! Hammer.JS - v2.0.8 - 2016-04-23
 * http://hammerjs.github.io/
 *
 * Copyright (c) 2016 Jorik Tangelder;
 * Licensed under the MIT license */
!function(a,b,c,d){"use strict";function e(a,b,c){return setTimeout(j(a,c),b)}function f(a,b,c){return Array.isArray(a)?(g(a,c[b],c),!0):!1}function g(a,b,c){var e;if(a)if(a.forEach)a.forEach(b,c);else if(a.length!==d)for(e=0;e<a.length;)b.call(c,a[e],e,a),e++;else for(e in a)a.hasOwnProperty(e)&&b.call(c,a[e],e,a)}function h(b,c,d){var e="DEPRECATED METHOD: "+c+"\n"+d+" AT \n";return function(){var c=new Error("get-stack-trace"),d=c&&c.stack?c.stack.replace(/^[^\(]+?[\n$]/gm,"").replace(/^\s+at\s+/gm,"").replace(/^Object.<anonymous>\s*\(/gm,"{anonymous}()@"):"Unknown Stack Trace",f=a.console&&(a.console.warn||a.console.log);return f&&f.call(a.console,e,d),b.apply(this,arguments)}}function i(a,b,c){var d,e=b.prototype;d=a.prototype=Object.create(e),d.constructor=a,d._super=e,c&&la(d,c)}function j(a,b){return function(){return a.apply(b,arguments)}}function k(a,b){return typeof a==oa?a.apply(b?b[0]||d:d,b):a}function l(a,b){return a===d?b:a}function m(a,b,c){g(q(b),function(b){a.addEventListener(b,c,!1)})}function n(a,b,c){g(q(b),function(b){a.removeEventListener(b,c,!1)})}function o(a,b){for(;a;){if(a==b)return!0;a=a.parentNode}return!1}function p(a,b){return a.indexOf(b)>-1}function q(a){return a.trim().split(/\s+/g)}function r(a,b,c){if(a.indexOf&&!c)return a.indexOf(b);for(var d=0;d<a.length;){if(c&&a[d][c]==b||!c&&a[d]===b)return d;d++}return-1}function s(a){return Array.prototype.slice.call(a,0)}function t(a,b,c){for(var d=[],e=[],f=0;f<a.length;){var g=b?a[f][b]:a[f];r(e,g)<0&&d.push(a[f]),e[f]=g,f++}return c&&(d=b?d.sort(function(a,c){return a[b]>c[b]}):d.sort()),d}function u(a,b){for(var c,e,f=b[0].toUpperCase()+b.slice(1),g=0;g<ma.length;){if(c=ma[g],e=c?c+f:b,e in a)return e;g++}return d}function v(){return ua++}function w(b){var c=b.ownerDocument||b;return c.defaultView||c.parentWindow||a}function x(a,b){var c=this;this.manager=a,this.callback=b,this.element=a.element,this.target=a.options.inputTarget,this.domHandler=function(b){k(a.options.enable,[a])&&c.handler(b)},this.init()}function y(a){var b,c=a.options.inputClass;return new(b=c?c:xa?M:ya?P:wa?R:L)(a,z)}function z(a,b,c){var d=c.pointers.length,e=c.changedPointers.length,f=b&Ea&&d-e===0,g=b&(Ga|Ha)&&d-e===0;c.isFirst=!!f,c.isFinal=!!g,f&&(a.session={}),c.eventType=b,A(a,c),a.emit("hammer.input",c),a.recognize(c),a.session.prevInput=c}function A(a,b){var c=a.session,d=b.pointers,e=d.length;c.firstInput||(c.firstInput=D(b)),e>1&&!c.firstMultiple?c.firstMultiple=D(b):1===e&&(c.firstMultiple=!1);var f=c.firstInput,g=c.firstMultiple,h=g?g.center:f.center,i=b.center=E(d);b.timeStamp=ra(),b.deltaTime=b.timeStamp-f.timeStamp,b.angle=I(h,i),b.distance=H(h,i),B(c,b),b.offsetDirection=G(b.deltaX,b.deltaY);var j=F(b.deltaTime,b.deltaX,b.deltaY);b.overallVelocityX=j.x,b.overallVelocityY=j.y,b.overallVelocity=qa(j.x)>qa(j.y)?j.x:j.y,b.scale=g?K(g.pointers,d):1,b.rotation=g?J(g.pointers,d):0,b.maxPointers=c.prevInput?b.pointers.length>c.prevInput.maxPointers?b.pointers.length:c.prevInput.maxPointers:b.pointers.length,C(c,b);var k=a.element;o(b.srcEvent.target,k)&&(k=b.srcEvent.target),b.target=k}function B(a,b){var c=b.center,d=a.offsetDelta||{},e=a.prevDelta||{},f=a.prevInput||{};b.eventType!==Ea&&f.eventType!==Ga||(e=a.prevDelta={x:f.deltaX||0,y:f.deltaY||0},d=a.offsetDelta={x:c.x,y:c.y}),b.deltaX=e.x+(c.x-d.x),b.deltaY=e.y+(c.y-d.y)}function C(a,b){var c,e,f,g,h=a.lastInterval||b,i=b.timeStamp-h.timeStamp;if(b.eventType!=Ha&&(i>Da||h.velocity===d)){var j=b.deltaX-h.deltaX,k=b.deltaY-h.deltaY,l=F(i,j,k);e=l.x,f=l.y,c=qa(l.x)>qa(l.y)?l.x:l.y,g=G(j,k),a.lastInterval=b}else c=h.velocity,e=h.velocityX,f=h.velocityY,g=h.direction;b.velocity=c,b.velocityX=e,b.velocityY=f,b.direction=g}function D(a){for(var b=[],c=0;c<a.pointers.length;)b[c]={clientX:pa(a.pointers[c].clientX),clientY:pa(a.pointers[c].clientY)},c++;return{timeStamp:ra(),pointers:b,center:E(b),deltaX:a.deltaX,deltaY:a.deltaY}}function E(a){var b=a.length;if(1===b)return{x:pa(a[0].clientX),y:pa(a[0].clientY)};for(var c=0,d=0,e=0;b>e;)c+=a[e].clientX,d+=a[e].clientY,e++;return{x:pa(c/b),y:pa(d/b)}}function F(a,b,c){return{x:b/a||0,y:c/a||0}}function G(a,b){return a===b?Ia:qa(a)>=qa(b)?0>a?Ja:Ka:0>b?La:Ma}function H(a,b,c){c||(c=Qa);var d=b[c[0]]-a[c[0]],e=b[c[1]]-a[c[1]];return Math.sqrt(d*d+e*e)}function I(a,b,c){c||(c=Qa);var d=b[c[0]]-a[c[0]],e=b[c[1]]-a[c[1]];return 180*Math.atan2(e,d)/Math.PI}function J(a,b){return I(b[1],b[0],Ra)+I(a[1],a[0],Ra)}function K(a,b){return H(b[0],b[1],Ra)/H(a[0],a[1],Ra)}function L(){this.evEl=Ta,this.evWin=Ua,this.pressed=!1,x.apply(this,arguments)}function M(){this.evEl=Xa,this.evWin=Ya,x.apply(this,arguments),this.store=this.manager.session.pointerEvents=[]}function N(){this.evTarget=$a,this.evWin=_a,this.started=!1,x.apply(this,arguments)}function O(a,b){var c=s(a.touches),d=s(a.changedTouches);return b&(Ga|Ha)&&(c=t(c.concat(d),"identifier",!0)),[c,d]}function P(){this.evTarget=bb,this.targetIds={},x.apply(this,arguments)}function Q(a,b){var c=s(a.touches),d=this.targetIds;if(b&(Ea|Fa)&&1===c.length)return d[c[0].identifier]=!0,[c,c];var e,f,g=s(a.changedTouches),h=[],i=this.target;if(f=c.filter(function(a){return o(a.target,i)}),b===Ea)for(e=0;e<f.length;)d[f[e].identifier]=!0,e++;for(e=0;e<g.length;)d[g[e].identifier]&&h.push(g[e]),b&(Ga|Ha)&&delete d[g[e].identifier],e++;return h.length?[t(f.concat(h),"identifier",!0),h]:void 0}function R(){x.apply(this,arguments);var a=j(this.handler,this);this.touch=new P(this.manager,a),this.mouse=new L(this.manager,a),this.primaryTouch=null,this.lastTouches=[]}function S(a,b){a&Ea?(this.primaryTouch=b.changedPointers[0].identifier,T.call(this,b)):a&(Ga|Ha)&&T.call(this,b)}function T(a){var b=a.changedPointers[0];if(b.identifier===this.primaryTouch){var c={x:b.clientX,y:b.clientY};this.lastTouches.push(c);var d=this.lastTouches,e=function(){var a=d.indexOf(c);a>-1&&d.splice(a,1)};setTimeout(e,cb)}}function U(a){for(var b=a.srcEvent.clientX,c=a.srcEvent.clientY,d=0;d<this.lastTouches.length;d++){var e=this.lastTouches[d],f=Math.abs(b-e.x),g=Math.abs(c-e.y);if(db>=f&&db>=g)return!0}return!1}function V(a,b){this.manager=a,this.set(b)}function W(a){if(p(a,jb))return jb;var b=p(a,kb),c=p(a,lb);return b&&c?jb:b||c?b?kb:lb:p(a,ib)?ib:hb}function X(){if(!fb)return!1;var b={},c=a.CSS&&a.CSS.supports;return["auto","manipulation","pan-y","pan-x","pan-x pan-y","none"].forEach(function(d){b[d]=c?a.CSS.supports("touch-action",d):!0}),b}function Y(a){this.options=la({},this.defaults,a||{}),this.id=v(),this.manager=null,this.options.enable=l(this.options.enable,!0),this.state=nb,this.simultaneous={},this.requireFail=[]}function Z(a){return a&sb?"cancel":a&qb?"end":a&pb?"move":a&ob?"start":""}function $(a){return a==Ma?"down":a==La?"up":a==Ja?"left":a==Ka?"right":""}function _(a,b){var c=b.manager;return c?c.get(a):a}function aa(){Y.apply(this,arguments)}function ba(){aa.apply(this,arguments),this.pX=null,this.pY=null}function ca(){aa.apply(this,arguments)}function da(){Y.apply(this,arguments),this._timer=null,this._input=null}function ea(){aa.apply(this,arguments)}function fa(){aa.apply(this,arguments)}function ga(){Y.apply(this,arguments),this.pTime=!1,this.pCenter=!1,this._timer=null,this._input=null,this.count=0}function ha(a,b){return b=b||{},b.recognizers=l(b.recognizers,ha.defaults.preset),new ia(a,b)}function ia(a,b){this.options=la({},ha.defaults,b||{}),this.options.inputTarget=this.options.inputTarget||a,this.handlers={},this.session={},this.recognizers=[],this.oldCssProps={},this.element=a,this.input=y(this),this.touchAction=new V(this,this.options.touchAction),ja(this,!0),g(this.options.recognizers,function(a){var b=this.add(new a[0](a[1]));a[2]&&b.recognizeWith(a[2]),a[3]&&b.requireFailure(a[3])},this)}function ja(a,b){var c=a.element;if(c.style){var d;g(a.options.cssProps,function(e,f){d=u(c.style,f),b?(a.oldCssProps[d]=c.style[d],c.style[d]=e):c.style[d]=a.oldCssProps[d]||""}),b||(a.oldCssProps={})}}function ka(a,c){var d=b.createEvent("Event");d.initEvent(a,!0,!0),d.gesture=c,c.target.dispatchEvent(d)}var la,ma=["","webkit","Moz","MS","ms","o"],na=b.createElement("div"),oa="function",pa=Math.round,qa=Math.abs,ra=Date.now;la="function"!=typeof Object.assign?function(a){if(a===d||null===a)throw new TypeError("Cannot convert undefined or null to object");for(var b=Object(a),c=1;c<arguments.length;c++){var e=arguments[c];if(e!==d&&null!==e)for(var f in e)e.hasOwnProperty(f)&&(b[f]=e[f])}return b}:Object.assign;var sa=h(function(a,b,c){for(var e=Object.keys(b),f=0;f<e.length;)(!c||c&&a[e[f]]===d)&&(a[e[f]]=b[e[f]]),f++;return a},"extend","Use `assign`."),ta=h(function(a,b){return sa(a,b,!0)},"merge","Use `assign`."),ua=1,va=/mobile|tablet|ip(ad|hone|od)|android/i,wa="ontouchstart"in a,xa=u(a,"PointerEvent")!==d,ya=wa&&va.test(navigator.userAgent),za="touch",Aa="pen",Ba="mouse",Ca="kinect",Da=25,Ea=1,Fa=2,Ga=4,Ha=8,Ia=1,Ja=2,Ka=4,La=8,Ma=16,Na=Ja|Ka,Oa=La|Ma,Pa=Na|Oa,Qa=["x","y"],Ra=["clientX","clientY"];x.prototype={handler:function(){},init:function(){this.evEl&&m(this.element,this.evEl,this.domHandler),this.evTarget&&m(this.target,this.evTarget,this.domHandler),this.evWin&&m(w(this.element),this.evWin,this.domHandler)},destroy:function(){this.evEl&&n(this.element,this.evEl,this.domHandler),this.evTarget&&n(this.target,this.evTarget,this.domHandler),this.evWin&&n(w(this.element),this.evWin,this.domHandler)}};var Sa={mousedown:Ea,mousemove:Fa,mouseup:Ga},Ta="mousedown",Ua="mousemove mouseup";i(L,x,{handler:function(a){var b=Sa[a.type];b&Ea&&0===a.button&&(this.pressed=!0),b&Fa&&1!==a.which&&(b=Ga),this.pressed&&(b&Ga&&(this.pressed=!1),this.callback(this.manager,b,{pointers:[a],changedPointers:[a],pointerType:Ba,srcEvent:a}))}});var Va={pointerdown:Ea,pointermove:Fa,pointerup:Ga,pointercancel:Ha,pointerout:Ha},Wa={2:za,3:Aa,4:Ba,5:Ca},Xa="pointerdown",Ya="pointermove pointerup pointercancel";a.MSPointerEvent&&!a.PointerEvent&&(Xa="MSPointerDown",Ya="MSPointerMove MSPointerUp MSPointerCancel"),i(M,x,{handler:function(a){var b=this.store,c=!1,d=a.type.toLowerCase().replace("ms",""),e=Va[d],f=Wa[a.pointerType]||a.pointerType,g=f==za,h=r(b,a.pointerId,"pointerId");e&Ea&&(0===a.button||g)?0>h&&(b.push(a),h=b.length-1):e&(Ga|Ha)&&(c=!0),0>h||(b[h]=a,this.callback(this.manager,e,{pointers:b,changedPointers:[a],pointerType:f,srcEvent:a}),c&&b.splice(h,1))}});var Za={touchstart:Ea,touchmove:Fa,touchend:Ga,touchcancel:Ha},$a="touchstart",_a="touchstart touchmove touchend touchcancel";i(N,x,{handler:function(a){var b=Za[a.type];if(b===Ea&&(this.started=!0),this.started){var c=O.call(this,a,b);b&(Ga|Ha)&&c[0].length-c[1].length===0&&(this.started=!1),this.callback(this.manager,b,{pointers:c[0],changedPointers:c[1],pointerType:za,srcEvent:a})}}});var ab={touchstart:Ea,touchmove:Fa,touchend:Ga,touchcancel:Ha},bb="touchstart touchmove touchend touchcancel";i(P,x,{handler:function(a){var b=ab[a.type],c=Q.call(this,a,b);c&&this.callback(this.manager,b,{pointers:c[0],changedPointers:c[1],pointerType:za,srcEvent:a})}});var cb=2500,db=25;i(R,x,{handler:function(a,b,c){var d=c.pointerType==za,e=c.pointerType==Ba;if(!(e&&c.sourceCapabilities&&c.sourceCapabilities.firesTouchEvents)){if(d)S.call(this,b,c);else if(e&&U.call(this,c))return;this.callback(a,b,c)}},destroy:function(){this.touch.destroy(),this.mouse.destroy()}});var eb=u(na.style,"touchAction"),fb=eb!==d,gb="compute",hb="auto",ib="manipulation",jb="none",kb="pan-x",lb="pan-y",mb=X();V.prototype={set:function(a){a==gb&&(a=this.compute()),fb&&this.manager.element.style&&mb[a]&&(this.manager.element.style[eb]=a),this.actions=a.toLowerCase().trim()},update:function(){this.set(this.manager.options.touchAction)},compute:function(){var a=[];return g(this.manager.recognizers,function(b){k(b.options.enable,[b])&&(a=a.concat(b.getTouchAction()))}),W(a.join(" "))},preventDefaults:function(a){var b=a.srcEvent,c=a.offsetDirection;if(this.manager.session.prevented)return void b.preventDefault();var d=this.actions,e=p(d,jb)&&!mb[jb],f=p(d,lb)&&!mb[lb],g=p(d,kb)&&!mb[kb];if(e){var h=1===a.pointers.length,i=a.distance<2,j=a.deltaTime<250;if(h&&i&&j)return}return g&&f?void 0:e||f&&c&Na||g&&c&Oa?this.preventSrc(b):void 0},preventSrc:function(a){this.manager.session.prevented=!0,a.preventDefault()}};var nb=1,ob=2,pb=4,qb=8,rb=qb,sb=16,tb=32;Y.prototype={defaults:{},set:function(a){return la(this.options,a),this.manager&&this.manager.touchAction.update(),this},recognizeWith:function(a){if(f(a,"recognizeWith",this))return this;var b=this.simultaneous;return a=_(a,this),b[a.id]||(b[a.id]=a,a.recognizeWith(this)),this},dropRecognizeWith:function(a){return f(a,"dropRecognizeWith",this)?this:(a=_(a,this),delete this.simultaneous[a.id],this)},requireFailure:function(a){if(f(a,"requireFailure",this))return this;var b=this.requireFail;return a=_(a,this),-1===r(b,a)&&(b.push(a),a.requireFailure(this)),this},dropRequireFailure:function(a){if(f(a,"dropRequireFailure",this))return this;a=_(a,this);var b=r(this.requireFail,a);return b>-1&&this.requireFail.splice(b,1),this},hasRequireFailures:function(){return this.requireFail.length>0},canRecognizeWith:function(a){return!!this.simultaneous[a.id]},emit:function(a){function b(b){c.manager.emit(b,a)}var c=this,d=this.state;qb>d&&b(c.options.event+Z(d)),b(c.options.event),a.additionalEvent&&b(a.additionalEvent),d>=qb&&b(c.options.event+Z(d))},tryEmit:function(a){return this.canEmit()?this.emit(a):void(this.state=tb)},canEmit:function(){for(var a=0;a<this.requireFail.length;){if(!(this.requireFail[a].state&(tb|nb)))return!1;a++}return!0},recognize:function(a){var b=la({},a);return k(this.options.enable,[this,b])?(this.state&(rb|sb|tb)&&(this.state=nb),this.state=this.process(b),void(this.state&(ob|pb|qb|sb)&&this.tryEmit(b))):(this.reset(),void(this.state=tb))},process:function(a){},getTouchAction:function(){},reset:function(){}},i(aa,Y,{defaults:{pointers:1},attrTest:function(a){var b=this.options.pointers;return 0===b||a.pointers.length===b},process:function(a){var b=this.state,c=a.eventType,d=b&(ob|pb),e=this.attrTest(a);return d&&(c&Ha||!e)?b|sb:d||e?c&Ga?b|qb:b&ob?b|pb:ob:tb}}),i(ba,aa,{defaults:{event:"pan",threshold:10,pointers:1,direction:Pa},getTouchAction:function(){var a=this.options.direction,b=[];return a&Na&&b.push(lb),a&Oa&&b.push(kb),b},directionTest:function(a){var b=this.options,c=!0,d=a.distance,e=a.direction,f=a.deltaX,g=a.deltaY;return e&b.direction||(b.direction&Na?(e=0===f?Ia:0>f?Ja:Ka,c=f!=this.pX,d=Math.abs(a.deltaX)):(e=0===g?Ia:0>g?La:Ma,c=g!=this.pY,d=Math.abs(a.deltaY))),a.direction=e,c&&d>b.threshold&&e&b.direction},attrTest:function(a){return aa.prototype.attrTest.call(this,a)&&(this.state&ob||!(this.state&ob)&&this.directionTest(a))},emit:function(a){this.pX=a.deltaX,this.pY=a.deltaY;var b=$(a.direction);b&&(a.additionalEvent=this.options.event+b),this._super.emit.call(this,a)}}),i(ca,aa,{defaults:{event:"pinch",threshold:0,pointers:2},getTouchAction:function(){return[jb]},attrTest:function(a){return this._super.attrTest.call(this,a)&&(Math.abs(a.scale-1)>this.options.threshold||this.state&ob)},emit:function(a){if(1!==a.scale){var b=a.scale<1?"in":"out";a.additionalEvent=this.options.event+b}this._super.emit.call(this,a)}}),i(da,Y,{defaults:{event:"press",pointers:1,time:251,threshold:9},getTouchAction:function(){return[hb]},process:function(a){var b=this.options,c=a.pointers.length===b.pointers,d=a.distance<b.threshold,f=a.deltaTime>b.time;if(this._input=a,!d||!c||a.eventType&(Ga|Ha)&&!f)this.reset();else if(a.eventType&Ea)this.reset(),this._timer=e(function(){this.state=rb,this.tryEmit()},b.time,this);else if(a.eventType&Ga)return rb;return tb},reset:function(){clearTimeout(this._timer)},emit:function(a){this.state===rb&&(a&&a.eventType&Ga?this.manager.emit(this.options.event+"up",a):(this._input.timeStamp=ra(),this.manager.emit(this.options.event,this._input)))}}),i(ea,aa,{defaults:{event:"rotate",threshold:0,pointers:2},getTouchAction:function(){return[jb]},attrTest:function(a){return this._super.attrTest.call(this,a)&&(Math.abs(a.rotation)>this.options.threshold||this.state&ob)}}),i(fa,aa,{defaults:{event:"swipe",threshold:10,velocity:.3,direction:Na|Oa,pointers:1},getTouchAction:function(){return ba.prototype.getTouchAction.call(this)},attrTest:function(a){var b,c=this.options.direction;return c&(Na|Oa)?b=a.overallVelocity:c&Na?b=a.overallVelocityX:c&Oa&&(b=a.overallVelocityY),this._super.attrTest.call(this,a)&&c&a.offsetDirection&&a.distance>this.options.threshold&&a.maxPointers==this.options.pointers&&qa(b)>this.options.velocity&&a.eventType&Ga},emit:function(a){var b=$(a.offsetDirection);b&&this.manager.emit(this.options.event+b,a),this.manager.emit(this.options.event,a)}}),i(ga,Y,{defaults:{event:"tap",pointers:1,taps:1,interval:300,time:250,threshold:9,posThreshold:10},getTouchAction:function(){return[ib]},process:function(a){var b=this.options,c=a.pointers.length===b.pointers,d=a.distance<b.threshold,f=a.deltaTime<b.time;if(this.reset(),a.eventType&Ea&&0===this.count)return this.failTimeout();if(d&&f&&c){if(a.eventType!=Ga)return this.failTimeout();var g=this.pTime?a.timeStamp-this.pTime<b.interval:!0,h=!this.pCenter||H(this.pCenter,a.center)<b.posThreshold;this.pTime=a.timeStamp,this.pCenter=a.center,h&&g?this.count+=1:this.count=1,this._input=a;var i=this.count%b.taps;if(0===i)return this.hasRequireFailures()?(this._timer=e(function(){this.state=rb,this.tryEmit()},b.interval,this),ob):rb}return tb},failTimeout:function(){return this._timer=e(function(){this.state=tb},this.options.interval,this),tb},reset:function(){clearTimeout(this._timer)},emit:function(){this.state==rb&&(this._input.tapCount=this.count,this.manager.emit(this.options.event,this._input))}}),ha.VERSION="2.0.8",ha.defaults={domEvents:!1,touchAction:gb,enable:!0,inputTarget:null,inputClass:null,preset:[[ea,{enable:!1}],[ca,{enable:!1},["rotate"]],[fa,{direction:Na}],[ba,{direction:Na},["swipe"]],[ga],[ga,{event:"doubletap",taps:2},["tap"]],[da]],cssProps:{userSelect:"none",touchSelect:"none",touchCallout:"none",contentZooming:"none",userDrag:"none",tapHighlightColor:"rgba(0,0,0,0)"}};var ub=1,vb=2;ia.prototype={set:function(a){return la(this.options,a),a.touchAction&&this.touchAction.update(),a.inputTarget&&(this.input.destroy(),this.input.target=a.inputTarget,this.input.init()),this},stop:function(a){this.session.stopped=a?vb:ub},recognize:function(a){var b=this.session;if(!b.stopped){this.touchAction.preventDefaults(a);var c,d=this.recognizers,e=b.curRecognizer;(!e||e&&e.state&rb)&&(e=b.curRecognizer=null);for(var f=0;f<d.length;)c=d[f],b.stopped===vb||e&&c!=e&&!c.canRecognizeWith(e)?c.reset():c.recognize(a),!e&&c.state&(ob|pb|qb)&&(e=b.curRecognizer=c),f++}},get:function(a){if(a instanceof Y)return a;for(var b=this.recognizers,c=0;c<b.length;c++)if(b[c].options.event==a)return b[c];return null},add:function(a){if(f(a,"add",this))return this;var b=this.get(a.options.event);return b&&this.remove(b),this.recognizers.push(a),a.manager=this,this.touchAction.update(),a},remove:function(a){if(f(a,"remove",this))return this;if(a=this.get(a)){var b=this.recognizers,c=r(b,a);-1!==c&&(b.splice(c,1),this.touchAction.update())}return this},on:function(a,b){if(a!==d&&b!==d){var c=this.handlers;return g(q(a),function(a){c[a]=c[a]||[],c[a].push(b)}),this}},off:function(a,b){if(a!==d){var c=this.handlers;return g(q(a),function(a){b?c[a]&&c[a].splice(r(c[a],b),1):delete c[a]}),this}},emit:function(a,b){this.options.domEvents&&ka(a,b);var c=this.handlers[a]&&this.handlers[a].slice();if(c&&c.length){b.type=a,b.preventDefault=function(){b.srcEvent.preventDefault()};for(var d=0;d<c.length;)c[d](b),d++}},destroy:function(){this.element&&ja(this,!1),this.handlers={},this.session={},this.input.destroy(),this.element=null}},la(ha,{INPUT_START:Ea,INPUT_MOVE:Fa,INPUT_END:Ga,INPUT_CANCEL:Ha,STATE_POSSIBLE:nb,STATE_BEGAN:ob,STATE_CHANGED:pb,STATE_ENDED:qb,STATE_RECOGNIZED:rb,STATE_CANCELLED:sb,STATE_FAILED:tb,DIRECTION_NONE:Ia,DIRECTION_LEFT:Ja,DIRECTION_RIGHT:Ka,DIRECTION_UP:La,DIRECTION_DOWN:Ma,DIRECTION_HORIZONTAL:Na,DIRECTION_VERTICAL:Oa,DIRECTION_ALL:Pa,Manager:ia,Input:x,TouchAction:V,TouchInput:P,MouseInput:L,PointerEventInput:M,TouchMouseInput:R,SingleTouchInput:N,Recognizer:Y,AttrRecognizer:aa,Tap:ga,Pan:ba,Swipe:fa,Pinch:ca,Rotate:ea,Press:da,on:m,off:n,each:g,merge:ta,extend:sa,assign:la,inherit:i,bindFn:j,prefixed:u});var wb="undefined"!=typeof a?a:"undefined"!=typeof self?self:{};wb.Hammer=ha, true?!(__WEBPACK_AMD_DEFINE_RESULT__ = function(){return ha}.call(exports, __webpack_require__, exports, module),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)):"undefined"!=typeof module&&module.exports?module.exports=ha:a[c]=ha}(window,document,"Hammer");


/***/ }),
/* 6 */
/***/ (function(module, exports) {

function UniqueMap(generateComparableKey) {
  this._generateComparableKey = generateComparableKey;
  this._map = new Map();
  this._comparableToOriginalKey = {};
  this.forEach = this._map.forEach.bind(this._map);
};

UniqueMap.prototype = {
  get: function(key) {
    return this._map.get(this._comparableToOriginalKey[this._generateComparableKey(key)]);
  },

  set: function(key, value) {
    this._storeKeyValue(key, value);
    this._updateSize()
  },

  _storeKeyValue: function(key, value) {
    this._comparableToOriginalKey[this._generateComparableKey(key)] = key;
    this._map.set(key, value);
  },

  _updateSize: function() {
    this.size = this._map.size;
  }
};

module.exports = UniqueMap;


/***/ })
/******/ ]);
//# sourceMappingURL=bundle.js.map