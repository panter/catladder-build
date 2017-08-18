'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _sshExec = require('ssh-exec');

var _sshExec2 = _interopRequireDefault(_sshExec);

var _utilsConfig_utils = require('../../utils/config_utils');

var CONFIGFILE = '.catladder.yaml';

exports['default'] = function (environment, done) {
  (0, _sshExec2['default'])('./bin/nodejs.sh restart', (0, _utilsConfig_utils.getSshConfig)(CONFIGFILE, environment), function () {
    done(null, 'server restarted');
  }).pipe(process.stdout);
};

module.exports = exports['default'];
//# sourceMappingURL=restart.js.map