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

exports['default'] = function (environment, done) {
  if (environment === undefined) environment = 'develop';

  var config = (0, _utilsConfig_utils.readConfig)();
  _prompt2['default'].start();

  if (!config.run) {
    throw new Error('please config `run`');
  }

  var appDir = config.appDir;
  var _config$run = config.run;
  var command = _config$run.command;
  var runEnv = _config$run.env;

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
    (0, _utilsExec2['default'])('' + (appDir ? 'cd ' + appDir + ' && ' : '') + envString + ' ' + command + ' ' + commandArgs);
  } catch (e) {
    // probably canceled
  } finally {
    if (_fs2['default'].existsSync(tempSettingsFile)) _fs2['default'].unlinkSync(tempSettingsFile);
  }
  done();
};

module.exports = exports['default'];
//# sourceMappingURL=run.js.map