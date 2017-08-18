'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _deploymentsGet_deployment_command = require('../deployments/get_deployment_command');

var _deploymentsGet_deployment_command2 = _interopRequireDefault(_deploymentsGet_deployment_command);

var _restart = require('./restart');

var _restart2 = _interopRequireDefault(_restart);

exports['default'] = function (environment, done) {
  var deployCommand = (0, _deploymentsGet_deployment_command2['default'])(environment, 'deploy');
  var next = function next() {
    return (0, _restart2['default'])(environment, done);
  };
  deployCommand(environment, next);
};

module.exports = exports['default'];
//# sourceMappingURL=upload_server.js.map