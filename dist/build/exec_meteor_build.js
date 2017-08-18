'use strict';

var _extends = require('babel-runtime/helpers/extends')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _child_process = require('child_process');

var _configsDirectories = require('../configs/directories');

var _utilsGit_utils = require('../utils/git_utils');

var execInstallNpmModules = function execInstallNpmModules(_ref) {
  var config = _ref.config;

  (0, _child_process.execSync)('meteor ' + (config.useYarn ? 'yarn' : 'npm') + ' install', { cwd: config.appDir, stdio: 'inherit' });
};

exports['default'] = function (_ref2) {
  var config = _ref2.config;
  var environment = _ref2.environment;
  var _ref2$additionalBuildEnv = _ref2.additionalBuildEnv;
  var additionalBuildEnv = _ref2$additionalBuildEnv === undefined ? {} : _ref2$additionalBuildEnv;
  var args = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

  var buildDir = (0, _configsDirectories.getBuildDir)({ config: config, environment: environment });
  var envConf = config.environments[environment];
  // read build params
  var _envConf$buildEnv = envConf.buildEnv;
  var buildEnv = _envConf$buildEnv === undefined ? {} : _envConf$buildEnv;

  var buildEnvWithAppVersions = _extends({}, additionalBuildEnv, {
    VERSION_BUILD_NUMBER: (0, _utilsGit_utils.getBuildNumberFromGit)(),
    VERSION_TAG: (0, _utilsGit_utils.getTagFromGit)(),
    VERSION_FULL_STRING: (0, _utilsGit_utils.getFullVersionString)(environment)
  }, buildEnv);
  var buildEnvString = _lodash2['default'].map(buildEnvWithAppVersions, function (value, key) {
    return key + '=\'' + value + '\'';
  }).join(' ');
  execInstallNpmModules({ config: config });
  (0, _child_process.execSync)(buildEnvString + ' meteor build ' + args.join(' ') + ' --server ' + envConf.url + ' ' + buildDir, { cwd: config.appDir, stdio: 'inherit' });
};

module.exports = exports['default'];
//# sourceMappingURL=exec_meteor_build.js.map