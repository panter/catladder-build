'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _jsYaml = require('js-yaml');

var _jsYaml2 = _interopRequireDefault(_jsYaml);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _child_process = require('child_process');

var readPass = function readPass(passPath) {
  try {
    return (0, _child_process.execSync)('pass show ' + passPath, { stdio: [0], encoding: 'utf-8' });
  } catch (error) {
    if (error.message.indexOf('is not in the password store') !== -1) {
      return null;
    }
    throw error;
  }
};

exports.readPass = readPass;
var hasPass = function hasPass(passPath) {
  return !_lodash2['default'].isEmpty(readPass(passPath));
};

exports.hasPass = hasPass;
var generatePass = function generatePass(passPath) {
  var length = arguments.length <= 1 || arguments[1] === undefined ? 32 : arguments[1];

  (0, _child_process.execSync)('pass generate ' + passPath + ' ' + length);
  return readPass(passPath);
};
exports.generatePass = generatePass;
var readPassYaml = function readPassYaml(passPath) {
  return _jsYaml2['default'].safeLoad(readPass(passPath));
};

exports.readPassYaml = readPassYaml;
var writePass = function writePass(passPath, input) {
  console.log('writing to pass', passPath);
  (0, _child_process.execSync)('pass insert ' + passPath + ' -m', { input: input });
};

exports.writePass = writePass;
var editPass = function editPass(passPath) {
  (0, _child_process.spawnSync)('pass', ['edit', passPath], {
    stdio: 'inherit'
  });
};
exports.editPass = editPass;
//# sourceMappingURL=pass_utils.js.map