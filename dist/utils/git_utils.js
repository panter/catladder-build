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
  return _lodash2['default'].trim((0, _child_process.execSync)('git describe --tags'));
};
exports.getTagFromGit = getTagFromGit;
//# sourceMappingURL=git_utils.js.map