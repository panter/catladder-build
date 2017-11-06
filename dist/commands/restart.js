'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _uiAction_title = require('../ui/action_title');

var _uiAction_title2 = _interopRequireDefault(_uiAction_title);

var _deploymentsGet_deployment_command = require('../deployments/get_deployment_command');

var _deploymentsGet_deployment_command2 = _interopRequireDefault(_deploymentsGet_deployment_command);

exports['default'] = function (environment, done) {
  var deployCommand = (0, _deploymentsGet_deployment_command2['default'])(environment, 'restart');
  (0, _uiAction_title2['default'])('restarting ' + environment);
  deployCommand(environment, done);
};

module.exports = exports['default'];
//# sourceMappingURL=restart.js.map