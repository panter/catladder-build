'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _jsYaml = require('js-yaml');

var _jsYaml2 = _interopRequireDefault(_jsYaml);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var writeConfig = function writeConfig(configFile, config) {
  var theyaml = _jsYaml2['default'].safeDump(config);
  _fs2['default'].writeFileSync(configFile, theyaml);
};
exports.writeConfig = writeConfig;
var readConfig = function readConfig(configFile) {
  return _jsYaml2['default'].safeLoad(_fs2['default'].readFileSync(configFile));
};

exports.readConfig = readConfig;
var getSshConfig = function getSshConfig(configFile, environment) {
  var config = readConfig(configFile);
  return _lodash2['default'].pick(config.environments[environment], ['host', 'user', 'password', 'key']);
};

exports.getSshConfig = getSshConfig;
var createEnvSh = function createEnvSh(_ref, envVars) {
  var environment = _ref.environment;
  var version = _ref.version;

  var getSanitziedValue = function getSanitziedValue(value) {
    if (_lodash2['default'].isObject(value)) {
      return JSON.stringify(value);
    }
    return value;
  };
  var body = _lodash2['default'].keys(envVars).map(function (key) {
    var value = getSanitziedValue(envVars[key]);

    return 'export ' + key + '=\'' + value + '\'';
  }).join('\n');
  var envHeader = '\n# autocreated with PANTER CATLADDER 🐱 🔧 v' + version + '\n# environment: ' + environment + '\n#\n# DO NOT EDIT, use\n# $ catladder setup ' + environment + '\n# to edit\n#\n  ';
  return envHeader + '\n' + body;
};
exports.createEnvSh = createEnvSh;
//# sourceMappingURL=config_utils.js.map