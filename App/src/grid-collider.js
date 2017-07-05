const gridCollider = {
  isColliding(center1, center2) {
    return center1.x === center2.x &&
      center1.y === center2.y;
  }
};

module.exports = gridCollider;
