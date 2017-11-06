'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _child_process = require('child_process');

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _configsDirectories = require('../configs/directories');

var _utilsConfig_utils = require('../utils/config_utils');

exports['default'] = function (environment, done) {
  var config = (0, _utilsConfig_utils.readConfig)();
  if (_fs2['default'].existsSync((0, _configsDirectories.getIosBuildProjectFolder)({ config: config, environment: environment }))) {
    (0, _child_process.execSync)('open ' + (0, _configsDirectories.getIosBuildProjectFolder)({ config: config, environment: environment }));
  } else {
    done(null, 'ios project does not exist under ' + (0, _configsDirectories.getIosBuildProjectFolder)({ config: config, environment: environment }));
  }
};

module.exports = exports['default'];
//# sourceMappingURL=ios_reveal_project.js.map