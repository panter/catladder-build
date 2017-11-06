'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _deploy = require('./deploy');

var _deploy2 = _interopRequireDefault(_deploy);

var _restart = require('./restart');

var _restart2 = _interopRequireDefault(_restart);

exports['default'] = {
  deploy: _deploy2['default'],
  restart: _restart2['default']
};
module.exports = exports['default'];
//# sourceMappingURL=index.js.map