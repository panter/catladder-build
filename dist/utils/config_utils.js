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

var CONFIGFILE = '.catladder.yaml';

var writeConfig = function writeConfig(configFile, config) {
  var theyaml = _jsYaml2['default'].safeDump(config);
  _fs2['default'].writeFileSync(configFile, theyaml);
};
exports.writeConfig = writeConfig;
var readConfig = function readConfig() {
  return _jsYaml2['default'].safeLoad(_fs2['default'].readFileSync(CONFIGFILE));
};

exports.readConfig = readConfig;
var getSshConfig = function getSshConfig(configFile, environment) {
  var config = readConfig();
  return _lodash2['default'].pick(config.environments[environment], ['host', 'user', 'password', 'key']);
};

exports.getSshConfig = getSshConfig;
var getSanitziedValue = function getSanitziedValue(value) {
  if (_lodash2['default'].isObject(value)) {
    return JSON.stringify(value);
  }
  return value;
};

var getKeyValueArraySanitized = function getKeyValueArraySanitized(envVars) {
  return _lodash2['default'].keys(envVars).map(function (key) {
    return {
      key: key,
      value: getSanitziedValue(envVars[key])
    };
  });
};

var getEnvCommandString = function getEnvCommandString(envVars) {
  return getKeyValueArraySanitized(envVars).map(function (_ref) {
    var key = _ref.key;
    var value = _ref.value;
    return key + '=\'' + value + '\'';
  }).join(' ');
};
exports.getEnvCommandString = getEnvCommandString;
var createEnvSh = function createEnvSh(_ref2, envVars) {
  var environment = _ref2.environment;
  var version = _ref2.version;

  // build is excluded, that is only used while building
  var body = getKeyValueArraySanitized(_lodash2['default'].omit(envVars, ['build'])).map(function (_ref3) {
    var key = _ref3.key;
    var value = _ref3.value;
    return 'export ' + key + '=\'' + value + '\'';
  }).join('\n');
  var envHeader = '\n# autocreated with PANTER CATLADDER 🐱 🔧 v' + version + '\n# environment: ' + environment + '\n#\n# DO NOT EDIT, use\n# $ catladder setup ' + environment + '\n# to edit\n#\n  ';
  return envHeader + '\n' + body;
};
exports.createEnvSh = createEnvSh;
//# sourceMappingURL=config_utils.js.map