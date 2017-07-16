'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _rimraf = require('rimraf');

var _rimraf2 = _interopRequireDefault(_rimraf);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _buildAndroid_build = require('../build/android_build');

var _configsDirectories = require('../configs/directories');

var _utilsGit_utils = require('../utils/git_utils');

var _utilsConfig_utils = require('../utils/config_utils');

var _uiAction_title = require('../ui/action_title');

var _uiAction_title2 = _interopRequireDefault(_uiAction_title);

var _android_prepare_for_store = require('./android_prepare_for_store');

var _android_prepare_for_store2 = _interopRequireDefault(_android_prepare_for_store);

var _buildExec_meteor_build = require('../build/exec_meteor_build');

var _buildExec_meteor_build2 = _interopRequireDefault(_buildExec_meteor_build);

var _ios_reveal_project = require('./ios_reveal_project');

var _ios_reveal_project2 = _interopRequireDefault(_ios_reveal_project);

var CONFIGFILE = '.catladder.yaml';

exports['default'] = function (environment, done) {
  var config = (0, _utilsConfig_utils.readConfig)(CONFIGFILE);
  var buildDir = (0, _configsDirectories.getBuildDir)({ config: config, environment: environment });
  (0, _uiAction_title2['default'])('building mobile apps ' + (0, _utilsGit_utils.getFullVersionString)(environment));
  console.log('build dir: ' + buildDir);

  // remove project folders if existing
  // otherwise apps might get bloated with old code
  if (_fs2['default'].existsSync((0, _buildAndroid_build.getAndroidBuildProjectFolder)({ config: config, environment: environment }))) {
    _rimraf2['default'].sync((0, _buildAndroid_build.getAndroidBuildProjectFolder)({ config: config, environment: environment }));
  }
  if (_fs2['default'].existsSync((0, _configsDirectories.getIosBuildProjectFolder)({ config: config, environment: environment }))) {
    _rimraf2['default'].sync((0, _configsDirectories.getIosBuildProjectFolder)({ config: config, environment: environment }));
  }

  (0, _buildExec_meteor_build2['default'])({ config: config, environment: environment });

  // open ios project if exists
  (0, _ios_reveal_project2['default'])(environment, config);

  // init android if it exists
  if (_fs2['default'].existsSync((0, _buildAndroid_build.getAndroidBuildDir)({ config: config, environment: environment }))) {
    (0, _android_prepare_for_store2['default'])(environment, done);
  } else {
    done(null, 'apps created in ' + buildDir);
  }
};

module.exports = exports['default'];
//# sourceMappingURL=build_apps.js.map