'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _lodash = require('lodash');

var _libsUtils = require('./libs/utils');

var _configsDirectories = require('../../configs/directories');

var _utilsConfig_utils = require('../../utils/config_utils');

var _utilsPass_utils = require('../../utils/pass_utils');

var _uiAction_title = require('../../ui/action_title');

var _uiAction_title2 = _interopRequireDefault(_uiAction_title);

var _utilsExec = require('../../utils/exec');

var _utilsExec2 = _interopRequireDefault(_utilsExec);

var sanitizeKubeValue = function sanitizeKubeValue(value) {
  return (0, _lodash.isObject)(value) ? JSON.stringify(value) : (0, _lodash.toString)(value);
};

exports['default'] = function (environment, done) {
  (0, _uiAction_title2['default'])('applying kubernetes config ' + environment + '  💫 ');
  var config = (0, _utilsConfig_utils.readConfig)();
  var imageName = (0, _libsUtils.getKubernetesImageNameFromConfig)(config, environment);
  (0, _uiAction_title2['default'])('imageName: ' + imageName);

  var passPathForEnvVars = (0, _configsDirectories.passEnvFile)({ config: config, environment: environment });
  var passEnv = (0, _utilsPass_utils.readPassYaml)(passPathForEnvVars);

  var _config$environments$environment = config.environments[environment];
  var url = _config$environments$environment.url;
  var environmentEnv = _config$environments$environment.env;
  var _config$environments$environment$deployment = _config$environments$environment.deployment;
  var commonDeploymentEnv = _config$environments$environment$deployment.env;
  var _config$environments$environment$deployment$kubeDeployments = _config$environments$environment$deployment.kubeDeployments;
  var kubeDeployments = _config$environments$environment$deployment$kubeDeployments === undefined ? [] : _config$environments$environment$deployment$kubeDeployments;

  kubeDeployments.forEach(function (deployment) {
    var file = deployment.file;
    var _deployment$env = deployment.env;
    var deploymentEnv = _deployment$env === undefined ? {} : _deployment$env;

    var compiled = (0, _lodash.template)(_fs2['default'].readFileSync(file));
    var baseEnv = {
      ROOT_URL: url,
      METEOR_SETTINGS: {
        'public': {
          KUBERNETES_IMAGE: imageName }
      }
    };
    // useful to show the actual image on the client
    var fullEnv = (0, _lodash.merge)({}, baseEnv, environmentEnv, commonDeploymentEnv, deploymentEnv, passEnv);
    console.log(fullEnv);
    process.exit();
    var kubeEnv = (0, _lodash.map)(fullEnv, function (value, name) {
      return { name: name, value: sanitizeKubeValue(value) };
    });
    var yaml = compiled({
      image: imageName,
      env: JSON.stringify(kubeEnv)
    });
    console.log('apply', yaml);
    (0, _utilsExec2['default'])('kubectl apply -f -', { input: yaml, stdio: ['pipe', 1, 2] });
  });
  done(null, 'done');
};

module.exports = exports['default'];
//# sourceMappingURL=applyConfig.js.map