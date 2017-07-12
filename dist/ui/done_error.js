'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _print_error = require('./print_error');

var _print_error2 = _interopRequireDefault(_print_error);

exports['default'] = function (error, message) {
  (0, _print_error2['default'])('');
  (0, _print_error2['default'])('');
  (0, _print_error2['default'])('╗ 🙀  ' + message + '  😿');
  (0, _print_error2['default'])('╚═══════════════════════════════════════════════════════════════════════════════');
  (0, _print_error2['default'])('😾         🐁 🐁 🐁 🐁 🐁 🐁');
  console.log('' + (error ? error.message || error.reason : ''));
  (0, _print_error2['default'])('');
  console.log(error ? error.stack : '');
  (0, _print_error2['default'])('════════════════════════════════════════════════════════════════════════════════');
};

module.exports = exports['default'];
//# sourceMappingURL=done_error.js.map