'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _packageJson = require('../../package.json');

var _print_yellow = require('./print_yellow');

var _print_yellow2 = _interopRequireDefault(_print_yellow);

exports['default'] = function () {
  (0, _print_yellow2['default'])('');
  (0, _print_yellow2['default'])('                                   🐱 🔧');
  (0, _print_yellow2['default'])('         ╔═════ PANTER CATLADDER ════════');
  (0, _print_yellow2['default'])('       ╔═╝');
  (0, _print_yellow2['default'])('     ╔═╝           v' + _packageJson.version);
  (0, _print_yellow2['default'])('   ╔═╝');
  (0, _print_yellow2['default'])(' ╔═╝');
  (0, _print_yellow2['default'])('═╝');
  (0, _print_yellow2['default'])('');
};

module.exports = exports['default'];
//# sourceMappingURL=intro.js.map