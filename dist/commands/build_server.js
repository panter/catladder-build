'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _utilsGit_utils = require('../utils/git_utils');

var _utilsConfig_utils = require('../utils/config_utils');

var _uiAction_title = require('../ui/action_title');

var _uiAction_title2 = _interopRequireDefault(_uiAction_title);

var _buildExec_meteor_build = require('../build/exec_meteor_build');

var _buildExec_meteor_build2 = _interopRequireDefault(_buildExec_meteor_build);

var CONFIGFILE = '.catladder.yaml';

exports['default'] = function (environment, done) {
  var config = (0, _utilsConfig_utils.readConfig)(CONFIGFILE);
  // read build params
  (0, _uiAction_title2['default'])('building server ' + (0, _utilsGit_utils.getFullVersionString)(environment));

  (0, _buildExec_meteor_build2['default'])({ config: config, environment: environment }, ['--server-only']);
  done(null, 'server built');
};

module.exports = exports['default'];
//# sourceMappingURL=build_server.js.map