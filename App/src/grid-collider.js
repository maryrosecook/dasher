const gridCollider = {
  isColliding(entity1, entity2) {
    return entity1.center.x === entity2.center.x &&
      entity1.center.y === entity2.center.y;
  }
};

module.exports = gridCollider;
