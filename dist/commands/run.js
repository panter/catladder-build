'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _lodash = require('lodash');

var _prompt = require('prompt');

var _prompt2 = _interopRequireDefault(_prompt);

var _uniqueFilename = require('unique-filename');

var _uniqueFilename2 = _interopRequireDefault(_uniqueFilename);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _configsDirectories = require('../configs/directories');

var _utilsConfig_utils = require('../utils/config_utils');

var _utilsPass_utils = require('../utils/pass_utils');

var _utilsExec = require('../utils/exec');

var _utilsExec2 = _interopRequireDefault(_utilsExec);

var getCommand = function getCommand(config) {
  var script = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

  if (script) {
    return config.scripts[script];
  }
  return config.run;
};

exports['default'] = function (environment, done) {
  if (environment === undefined) environment = 'develop';
  var script = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

  var config = (0, _utilsConfig_utils.readConfig)();
  _prompt2['default'].start();

  if (!config.run || !config.scripts) {
    throw new Error('please config `run` or `config`');
  }

  if (script && (!config.scripts || !config.scripts[script])) {
    throw new Error(script + ' does not exist in config.scripts');
  }
  var appDir = config.appDir;

  var _getCommand = getCommand(config, script);

  var command = _getCommand.command;
  var runEnv = _getCommand.env;
  var _getCommand$dir = _getCommand.dir;
  var dir = _getCommand$dir === undefined ? appDir : _getCommand$dir;

  var passPathForEnvVars = (0, _configsDirectories.passEnvFile)({ config: config, environment: environment });
  var passEnv = (0, _utilsPass_utils.readPassYaml)(passPathForEnvVars);

  var _ref = config.environments[environment] || {};

  var environmentEnv = _ref.env;

  var fullEnv = (0, _lodash.merge)({}, environmentEnv, passEnv, runEnv);
  var commandArgs = '';
  // damn https://github.com/meteor/meteor/issues/9907
  var tempSettingsFile = (0, _uniqueFilename2['default'])(_os2['default'].tmpdir(), 'settings');

  if (command === 'meteor' && fullEnv.METEOR_SETTINGS) {
    _fs2['default'].writeFileSync(tempSettingsFile, JSON.stringify(fullEnv.METEOR_SETTINGS));
    delete fullEnv.METEOR_SETTINGS;

    commandArgs = ' --settings ' + tempSettingsFile;
  }
  var envString = (0, _utilsConfig_utils.getEnvCommandString)(fullEnv);
  try {
    (0, _utilsExec2['default'])('' + (dir ? 'cd ' + dir + ' && ' : '') + envString + ' ' + command + ' ' + commandArgs);
  } catch (e) {
    // probably canceled
  } finally {
    if (_fs2['default'].existsSync(tempSettingsFile)) _fs2['default'].unlinkSync(tempSettingsFile);
  }
  done();
};

module.exports = exports['default'];
//# sourceMappingURL=run.js.map