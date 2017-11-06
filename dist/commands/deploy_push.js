'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _deploymentsGet_deployment_command = require('../deployments/get_deployment_command');

var _deploymentsGet_deployment_command2 = _interopRequireDefault(_deploymentsGet_deployment_command);

exports['default'] = function (environment, done) {
  var command = (0, _deploymentsGet_deployment_command2['default'])(environment, 'push');
  command(environment, done);
};

module.exports = exports['default'];
//# sourceMappingURL=deploy_push.js.map