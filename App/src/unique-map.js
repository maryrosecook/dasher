function UniqueMap(generateComparableKey) {
  this._generateComparableKey = generateComparableKey;
  this._map = new Map();
  this._comparableToRealKey = {};
  this.forEach = this._map.forEach.bind(this._map);
  this.keys = this._map.keys.bind(this._map);
  this.lastKey = undefined;
};

UniqueMap.prototype = {
  get: function(key) {
    return this._map.get(this._comparableToRealKey[
      this._generateComparableKey(key)]);
  },

  set: function(key, value) {
    this._storeKeyValue(key, value);
    this._updateSize();
  },

  _storeKeyValue: function(key, value) {
    let existingRealKey = this._existingRealKey(key);
    let realKey = existingRealKey !== undefined ?
        existingRealKey :
        key;

    this._comparableToRealKey[this._generateComparableKey(key)]
      = realKey;
    this._map.set(realKey, value);
  },

  _existingRealKey: function(key) {
    return this._comparableToRealKey[this._generateComparableKey(key)];
  },

  _updateSize: function() {
    this.size = this._map.size;
  }
};

module.exports = UniqueMap;
