'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _print_yellow = require('./print_yellow');

var _print_yellow2 = _interopRequireDefault(_print_yellow);

exports['default'] = function () {
  var message = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

  (0, _print_yellow2['default'])('');
  (0, _print_yellow2['default'])('');
  (0, _print_yellow2['default'])('╗');
  (0, _print_yellow2['default'])('╚═╗ ' + message + '  👋 🐱');
  (0, _print_yellow2['default'])('  ╚═════════════════════════════════════════════════════════════════════════════');
};

module.exports = exports['default'];
//# sourceMappingURL=done_success.js.map