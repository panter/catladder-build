'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _lodash = require('lodash');

var _utilsGit_utils = require('../../../utils/git_utils');

var _utilsConfig_utils = require('../../../utils/config_utils');

var CONFIGFILE = '.catladder.yaml';

var generateKubernetesImageName = function generateKubernetesImageName(config, environment) {
  var _config$dockerEndPoint = config.dockerEndPoint;
  var dockerEndPoint = _config$dockerEndPoint === undefined ? 'gcr.io/skynet-164509' : _config$dockerEndPoint;
  var _config$appname = config.appname;
  var appname = _config$appname === undefined ? 'unknown app' : _config$appname;

  var versionTag = (0, _utilsGit_utils.getFullVersionString)(environment);
  return dockerEndPoint + '/' + appname + ':' + versionTag;
};

exports.generateKubernetesImageName = generateKubernetesImageName;
var getKubernetesImageNameFromConfig = function getKubernetesImageNameFromConfig(config, environment) {
  return (0, _lodash.get)(config, ['environments', environment, 'deployment', 'image']);
};

exports.getKubernetesImageNameFromConfig = getKubernetesImageNameFromConfig;
var writeImageNameToConfig = function writeImageNameToConfig(config, environment, imageName) {
  (0, _lodash.set)(config, ['environments', environment, 'deployment', 'image'], imageName);
  (0, _utilsConfig_utils.writeConfig)(CONFIGFILE, config);
};
exports.writeImageNameToConfig = writeImageNameToConfig;
//# sourceMappingURL=utils.js.map