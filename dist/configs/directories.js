'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var getBuildDir = function getBuildDir(_ref) {
  var config = _ref.config;
  var environment = _ref.environment;
  return _path2['default'].resolve(config.buildDir + '/' + environment);
};
exports.getBuildDir = getBuildDir;
var getBuildDirDockerFile = function getBuildDirDockerFile(_ref2) {
  var config = _ref2.config;
  var environment = _ref2.environment;
  return getBuildDir({ config: config, environment: environment }) + '/Dockerfile';
};

exports.getBuildDirDockerFile = getBuildDirDockerFile;
var getIosBuildDir = function getIosBuildDir(_ref3) {
  var config = _ref3.config;
  var environment = _ref3.environment;
  return getBuildDir({ config: config, environment: environment }) + '/ios';
};
exports.getIosBuildDir = getIosBuildDir;
var getIosBuildProjectFolder = function getIosBuildProjectFolder(_ref4) {
  var config = _ref4.config;
  var environment = _ref4.environment;
  return getIosBuildDir({ config: config, environment: environment }) + '/project';
};

exports.getIosBuildProjectFolder = getIosBuildProjectFolder;
var passEnvFile = function passEnvFile(_ref5) {
  var config = _ref5.config;
  var environment = _ref5.environment;
  return config.passPath + '/' + environment + '/env.yaml';
};
exports.passEnvFile = passEnvFile;
//# sourceMappingURL=directories.js.map