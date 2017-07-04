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
