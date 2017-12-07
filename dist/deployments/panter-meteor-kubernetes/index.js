'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _applyConfig = require('./applyConfig');

var _applyConfig2 = _interopRequireDefault(_applyConfig);

var _deploy = require('./deploy');

var _deploy2 = _interopRequireDefault(_deploy);

var _push = require('./push');

var _push2 = _interopRequireDefault(_push);

exports['default'] = {
  push: _push2['default'],
  deploy: _deploy2['default'],
  applyConfig: _applyConfig2['default']
};
module.exports = exports['default'];
//# sourceMappingURL=index.js.map