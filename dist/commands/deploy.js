'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _utilsPass_utils = require('../utils/pass_utils');

var _uiAction_title = require('../ui/action_title');

var _uiAction_title2 = _interopRequireDefault(_uiAction_title);

var _deploymentsGet_deployment_command = require('../deployments/get_deployment_command');

var _deploymentsGet_deployment_command2 = _interopRequireDefault(_deploymentsGet_deployment_command);

exports['default'] = function (environment, done) {
  (0, _uiAction_title2['default'])('deploying ' + environment);
  // read it so that it asks for password
  // otherwise it asks in the middle of the build, which can take some minutes
  (0, _utilsPass_utils.readEnvFileFromPass)(environment);
  var command = (0, _deploymentsGet_deployment_command2['default'])(environment, 'deploy');
  command(environment, done);
};

module.exports = exports['default'];
//# sourceMappingURL=deploy.js.map