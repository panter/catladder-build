'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _utilsPass_utils = require('../utils/pass_utils');

var _configsDirectories = require('../configs/directories');

var _utilsConfig_utils = require('../utils/config_utils');

var CONFIGFILE = '.catladder.yaml';

exports['default'] = function (environment, done) {
  var config = (0, _utilsConfig_utils.readConfig)(CONFIGFILE);
  var passPathForEnvVars = (0, _configsDirectories.passEnvFile)({ config: config, environment: environment });
  (0, _utilsPass_utils.editPass)(passPathForEnvVars);
  done(null, 'env in pass edited. Remember that this not updates the server. Use catladder setup <env> to do so');
};

module.exports = exports['default'];
//# sourceMappingURL=edit_env.js.map