'use strict';

var _extends = require('babel-runtime/helpers/extends')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _child_process = require('child_process');

var _uiPrint_command = require('../ui/print_command');

var _uiPrint_command2 = _interopRequireDefault(_uiPrint_command);

exports['default'] = function (cmd) {
  var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  (0, _uiPrint_command2['default'])(cmd);
  return (0, _child_process.execSync)(cmd, _extends({ stdio: 'inherit' }, options));
};

module.exports = exports['default'];
//# sourceMappingURL=exec.js.map