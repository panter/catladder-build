'use strict';

var _extends = require('babel-runtime/helpers/extends')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _child_process = require('child_process');

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _lodash = require('lodash');

var _configsDirectories = require('../../configs/directories');

var _utilsGit_utils = require('../../utils/git_utils');

var _utilsConfig_utils = require('../../utils/config_utils');

var _utilsPass_utils = require('../../utils/pass_utils');

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
  console.log(cmd);
  (0, _child_process.execSync)(cmd, { stdio: 'inherit' });
};

exports['default'] = function (environment, done) {
  var config = (0, _utilsConfig_utils.readConfig)();
  var passPathForEnvVars = (0, _configsDirectories.passEnvFile)({ config: config, environment: environment });
  var passEnv = (0, _utilsPass_utils.readPassYaml)(passPathForEnvVars);
  var _config$dockerEndPoint = config.dockerEndPoint;
  var dockerEndPoint = _config$dockerEndPoint === undefined ? 'gcr.io/skynet-164509' : _config$dockerEndPoint;
  var _config$appname = config.appname;
  var appname = _config$appname === undefined ? 'unknown app' : _config$appname;

  console.log('would do the following if implemented: ');
  console.log('(but you can do it manually! 😽  )');
  console.log('  ');

  var dockerFile = createDockerFile({ config: config, environment: environment });
  console.log(dockerFile);
  var buildDir = (0, _configsDirectories.getBuildDir)({ environment: environment, config: config });
  var dockerBuildCommand = 'docker build -t ' + appname + ' -f ' + dockerFile + ' ' + buildDir;

  // exec(dockerBuildCommand);

  var versionTag = (0, _utilsGit_utils.getFullVersionString)(environment);
  var fullImageName = dockerEndPoint + '/' + appname + ':' + versionTag;
  // exec(`docker tag ${appname} ${fullImageName}`);
  // exec(`gcloud docker -- push ${fullImageName}`);

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
    var yaml = compiled({
      image: fullImageName,
      env: JSON.stringify(fullEnv)
    });
    console.log('would apply');
    console.log(yaml);
  });

  console.log('generate or adjust: kube/' + environment + '/deployment.' + appname + '_worker.yml (add tag ' + versionTag + ')');
  console.log('generate or adjust: kube/' + environment + '/deployment.' + appname + '_web.yml (add tag ' + versionTag + ')');
  console.log('kubectl apply -f kube/' + environment + '/deployment.' + appname + '_worker.yml');
  console.log('kubectl apply -f kube/' + environment + '/deployment.' + appname + '_web.yml');
  done(null, 'done');
};

module.exports = exports['default'];
//# sourceMappingURL=push_server.js.map