'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _child_process = require('child_process');

// we always multiply by 10 so that you can manipulate it a bit
var getBuildNumberFromGit = function getBuildNumberFromGit() {
  var factor = arguments.length <= 0 || arguments[0] === undefined ? 10 : arguments[0];
  return Number((0, _child_process.execSync)('git rev-list --count HEAD')) * factor;
};

exports.getBuildNumberFromGit = getBuildNumberFromGit;
var getTagFromGit = function getTagFromGit() {
  return _lodash2['default'].trim((0, _child_process.execSync)('git describe --tags --abbrev=0'));
};

exports.getTagFromGit = getTagFromGit;
var sanitizeVersionString = function sanitizeVersionString(versionString) {
  return versionString.replace('v', '');
};

exports.sanitizeVersionString = sanitizeVersionString;
var getVersionFromTag = function getVersionFromTag() {
  var parts = getTagFromGit().split('/');
  if (parts.length === 1) {
    return sanitizeVersionString(parts[0]);
  }
  return sanitizeVersionString(parts[parts.length - 1]);
};

exports.getVersionFromTag = getVersionFromTag;
var getFullGitVersion = function getFullGitVersion() {
  return getVersionFromTag() + '-' + getBuildNumberFromGit();
};

exports.getFullGitVersion = getFullGitVersion;
var getFullVersionString = function getFullVersionString(env) {
  return env + '-' + getFullGitVersion();
};
exports.getFullVersionString = getFullVersionString;
//# sourceMappingURL=git_utils.js.map