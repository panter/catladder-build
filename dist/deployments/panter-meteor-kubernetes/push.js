'use strict';

var _extends = require('babel-runtime/helpers/extends')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _child_process = require('child_process');

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _libsUtils = require('./libs/utils');

var _configsDirectories = require('../../configs/directories');

var _utilsConfig_utils = require('../../utils/config_utils');

var _uiAction_title = require('../../ui/action_title');

var _uiAction_title2 = _interopRequireDefault(_uiAction_title);

var _applyConfig = require('./applyConfig');

var _applyConfig2 = _interopRequireDefault(_applyConfig);

var _uiPrint_command = require('../../ui/print_command');

var _uiPrint_command2 = _interopRequireDefault(_uiPrint_command);

var createDockerFile = function createDockerFile(_ref) {
  var config = _ref.config;
  var environment = _ref.environment;

  var dockerFile = (0, _configsDirectories.getBuildDirDockerFile)({ config: config, environment: environment });
  _fs2['default'].writeFileSync(dockerFile, '\nFROM node:4.8.4\nADD app.tar.gz /app\nRUN cd /app/bundle/programs/server && npm install\nWORKDIR /app/bundle\nEXPOSE 8888\nCMD ["node", "main.js"]\n  ');
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

var exec = function exec(cmd) {
  var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  (0, _uiPrint_command2['default'])(cmd);
  (0, _child_process.execSync)(cmd, _extends({ stdio: 'inherit' }, options));
};

exports['default'] = function (environment, done) {
  (0, _uiAction_title2['default'])('  🎶    👊   push it real good ! 👊   🎶   ' + environment + ' 🎶 ');
  var config = (0, _utilsConfig_utils.readConfig)();
  var fullImageName = (0, _libsUtils.generateKubernetesImageName)(config, environment);

  (0, _uiAction_title2['default'])('image ' + fullImageName);

  var _config$appname = config.appname;
  var appname = _config$appname === undefined ? 'unknown app' : _config$appname;

  var dockerFile = createDockerFile({ config: config, environment: environment });
  var buildDir = (0, _configsDirectories.getBuildDir)({ environment: environment, config: config });
  var dockerBuildCommand = 'docker build -t ' + appname + ' -f ' + dockerFile + ' ' + buildDir;

  exec(dockerBuildCommand);

  (0, _libsUtils.writeImageNameToConfig)(config, environment, fullImageName);

  exec('docker tag ' + appname + ' ' + fullImageName);
  exec('gcloud docker -- push ' + fullImageName);

  (0, _applyConfig2['default'])(environment, done);
};

module.exports = exports['default'];
//# sourceMappingURL=push.js.map