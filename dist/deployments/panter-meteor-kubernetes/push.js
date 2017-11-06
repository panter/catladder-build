'use strict';

var _extends = require('babel-runtime/helpers/extends')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _child_process = require('child_process');

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _lodash = require('lodash');

var _configsDirectories = require('../../configs/directories');

var _utilsGit_utils = require('../../utils/git_utils');

var _utilsConfig_utils = require('../../utils/config_utils');

var _utilsPass_utils = require('../../utils/pass_utils');

var _uiAction_title = require('../../ui/action_title');

var _uiAction_title2 = _interopRequireDefault(_uiAction_title);

var _uiPrint_command = require('../../ui/print_command');

var _uiPrint_command2 = _interopRequireDefault(_uiPrint_command);

var copyExistingDockerfile = function copyExistingDockerfile(destination) {
  try {
    _fsExtra2['default'].copySync('./Dockerfile', destination);
  } catch (err) {
    console.error(err);
  }
};

var createDockerFile = function createDockerFile(_ref) {
  var config = _ref.config;
  var environment = _ref.environment;

  var dockerFile = (0, _configsDirectories.getBuildDirDockerFile)({ config: config, environment: environment });
  if (_fs2['default'].existsSync('./Dockerfile')) {
    copyExistingDockerfile(dockerFile);
  } else {
    _fs2['default'].writeFileSync(dockerFile, '\n        FROM node:4.8.4\n        ADD app.tar.gz /app\n        RUN cd /app/bundle/programs/server && npm install\n        WORKDIR /app/bundle\n        EXPOSE 8888\n        CMD ["node", "main.js"]\n  ');
  }
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
var sanitizeKubeValue = function sanitizeKubeValue(value) {
  return (0, _lodash.isObject)(value) ? JSON.stringify(value) : (0, _lodash.toString)(value);
};

exports['default'] = function (environment, done) {
  (0, _uiAction_title2['default'])('  🎶    👊   push it real good ! 👊   🎶   ' + environment + ' 🎶 ');
  var config = (0, _utilsConfig_utils.readConfig)();
  var passPathForEnvVars = (0, _configsDirectories.passEnvFile)({ config: config, environment: environment });
  var passEnv = (0, _utilsPass_utils.readPassYaml)(passPathForEnvVars);
  var _config$dockerEndPoint = config.dockerEndPoint;
  var dockerEndPoint = _config$dockerEndPoint === undefined ? 'gcr.io/skynet-164509' : _config$dockerEndPoint;
  var _config$appname = config.appname;
  var appname = _config$appname === undefined ? 'unknown app' : _config$appname;

  var dockerFile = createDockerFile({ config: config, environment: environment });
  var buildDir = (0, _configsDirectories.getBuildDir)({ environment: environment, config: config });
  var dockerBuildCommand = 'docker build -t ' + appname + ' -f ' + dockerFile + ' ' + buildDir;

  exec(dockerBuildCommand);

  var versionTag = (0, _utilsGit_utils.getFullVersionString)(environment);
  var fullImageName = dockerEndPoint + '/' + appname + ':' + versionTag;
  exec('docker tag ' + appname + ' ' + fullImageName);
  exec('gcloud docker -- push ' + fullImageName);

  var _config$environments$environment = config.environments[environment];
  var url = _config$environments$environment.url;
  var _config$environments$environment$deployment = _config$environments$environment.deployment;
  var commonDeploymentEnv = _config$environments$environment$deployment.env;
  var _config$environments$environment$deployment$kubeDeployments = _config$environments$environment$deployment.kubeDeployments;
  var kubeDeployments = _config$environments$environment$deployment$kubeDeployments === undefined ? [] : _config$environments$environment$deployment$kubeDeployments;

  kubeDeployments.forEach(function (deployment) {
    var file = deployment.file;
    var _deployment$env = deployment.env;
    var deploymentEnv = _deployment$env === undefined ? {} : _deployment$env;

    var compiled = (0, _lodash.template)(_fs2['default'].readFileSync(file));
    var fullEnv = _extends({}, passEnv, {
      ROOT_URL: url
    }, commonDeploymentEnv, deploymentEnv);

    var kubeEnv = (0, _lodash.map)(fullEnv, function (value, name) {
      return { name: name, value: sanitizeKubeValue(value) };
    });
    var yaml = compiled({
      image: fullImageName,
      env: JSON.stringify(kubeEnv)
    });
    console.log('apply', yaml);
    exec('kubectl apply -f -', { input: yaml, stdio: ['pipe', 1, 2] });
  });
  done(null, 'done');
};

module.exports = exports['default'];
//# sourceMappingURL=push.js.map