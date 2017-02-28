'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _colorsSafe = require('colors/safe');

var _colorsSafe2 = _interopRequireDefault(_colorsSafe);

var intro = function intro(line) {
  return console.log(_colorsSafe2['default'].yellow(line));
};
exports.intro = intro;
var actionTitle = function actionTitle(title) {
  intro('');
  intro('🐱 🔧 ' + title);
  intro('');
};
exports.actionTitle = actionTitle;
//# sourceMappingURL=logs.js.map