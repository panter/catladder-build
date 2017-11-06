'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _panterMeteorClassic = require('./panter-meteor-classic');

var _panterMeteorClassic2 = _interopRequireDefault(_panterMeteorClassic);

var _panterMeteorKubernetes = require('./panter-meteor-kubernetes');

var _panterMeteorKubernetes2 = _interopRequireDefault(_panterMeteorKubernetes);

exports['default'] = {
  'panter-meteor-classic': _panterMeteorClassic2['default'],
  'panter-meteor-kubernetes': _panterMeteorKubernetes2['default']
};
module.exports = exports['default'];
//# sourceMappingURL=index.js.map