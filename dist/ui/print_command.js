'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _colorsSafe = require('colors/safe');

var _colorsSafe2 = _interopRequireDefault(_colorsSafe);

exports['default'] = function (line) {
  return console.log(_colorsSafe2['default'].green('$ ' + line));
};

module.exports = exports['default'];
//# sourceMappingURL=print_command.js.map