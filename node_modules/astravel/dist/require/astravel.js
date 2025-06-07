"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.makeTraveler = makeTraveler;
Object.defineProperty(exports, "defaultTraveler", {
  enumerable: true,
  get: function get() {
    return _defaultTraveler.defaultTraveler;
  }
});
Object.defineProperty(exports, "attachComments", {
  enumerable: true,
  get: function get() {
    return _attachComments.attachComments;
  }
});

var _defaultTraveler = require("./defaultTraveler");

var _attachComments = require("./attachComments");

function makeTraveler(properties) {
  return _defaultTraveler.defaultTraveler.makeChild(properties);
}
//# sourceMappingURL=astravel.js.map