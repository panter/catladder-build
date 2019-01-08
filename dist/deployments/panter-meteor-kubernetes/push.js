'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _libsUtils = require('./libs/utils');

var _configsDirectories = require('../../configs/directories');

var _utilsConfig_utils = require('../../utils/config_utils');

var _uiAction_title = require('../../ui/action_title');

var _uiAction_title2 = _interopRequireDefault(_uiAction_title);

var _applyConfig = require('./applyConfig');

var _applyConfig2 = _interopRequireDefault(_applyConfig);

var _utilsExec = require('../../utils/exec');

var _utilsExec2 = _interopRequireDefault(_utilsExec);

var createDockerFile = function createDockerFile(_ref) {
  var nodeVersion = _ref.nodeVersion;
  var config = _ref.config;
  var environment = _ref.environment;

  var dockerFile = (0, _configsDirectories.getBuildDirDockerFile)({ config: config, environment: environment });

  _fs2['default'].writeFileSync(dockerFile, '\nFROM node:' + nodeVersion + '\nADD bundle /app\nRUN cd /app/programs/server && npm install\nWORKDIR /app\nEXPOSE 8888\nCMD ["node", "main.js"]\n  ');
  return dockerFile;
};
/* todo generate dockerfile and pipe in * */
/*
const dockerFile = `
  FROM node:4.8.4
  ADD build/production/app.tar.gz /app
  RUN cd /app/bundle/programs/server && npm install
  WORKDIR /app/bundle
  EXPOSE 8888
  CMD ["node", "main.js"]
` */

var getNodeVersion = function getNodeVersion(_ref2) {
  var environment = _ref2.environment;
  var config = _ref2.config;

  var buildDir = (0, _configsDirectories.getBuildDir)({ environment: environment, config: config });
  var meteorNodeVersionFile = buildDir + '/bundle/.node_version.txt';
  var versionString = (0, _utilsExec2['default'])('cat ' + meteorNodeVersionFile, { stdio: [0], encoding: 'utf-8' });
  return versionString.replace('v', '');
};

exports['default'] = function (environment, done) {
  (0, _uiAction_title2['default'])('  🎶    👊   push it real good ! 👊   🎶   ' + environment + ' 🎶 ');
  var config = (0, _utilsConfig_utils.readConfig)();
  var fullImageName = (0, _libsUtils.generateKubernetesImageName)(config, environment);

  (0, _uiAction_title2['default'])('image ' + fullImageName);

  var _config$appname = config.appname;
  var appname = _config$appname === undefined ? 'unknown app' : _config$appname;

  var nodeVersion = getNodeVersion({ environment: environment, config: config });
  console.log('using node version: ' + nodeVersion);
  // const nodeVersion = '8.9.1';
  var dockerFile = createDockerFile({ nodeVersion: nodeVersion, config: config, environment: environment });
  var buildDir = (0, _configsDirectories.getBuildDir)({ environment: environment, config: config });
  var dockerBuildCommand = 'docker build -t ' + appname + ' -f ' + dockerFile + ' ' + buildDir;

  (0, _utilsExec2['default'])(dockerBuildCommand);

  (0, _libsUtils.writeImageNameToConfig)(config, environment, fullImageName);

  (0, _utilsExec2['default'])('docker tag ' + appname + ' ' + fullImageName);

  try {
    (0, _utilsExec2['default'])('docker push ' + fullImageName);
  } catch (e) {
    console.warn('You need at least docker version 18.03.0');
    console.log();
    console.error(e);
    process.exit(1);
  }

  (0, _applyConfig2['default'])(environment, done);
};

module.exports = exports['default'];
//# sourceMappingURL=push.js.map