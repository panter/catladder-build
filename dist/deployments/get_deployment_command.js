'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _utilsConfig_utils = require('../utils/config_utils');

var _ = require('./');

var _2 = _interopRequireDefault(_);

exports['default'] = function (environment, command) {
  var config = (0, _utilsConfig_utils.readConfig)();
  var deployment = config.environments[environment].deployment;

  var _ref = deployment || {};

  var _ref$type = _ref.type;
  var type = _ref$type === undefined ? 'panter-meteor-classic' : _ref$type;

  if (_2['default'][type]) {
    if (_2['default'][type][command]) {
      return _2['default'][type][command];
    }
    throw new Error('Unkown deployment-command: ' + command + ' in type ' + type);
  } else {
    throw new Error('Unkown deployment-type: ' + type);
  }
};

module.exports = exports['default'];
//# sourceMappingURL=get_deployment_command.js.map