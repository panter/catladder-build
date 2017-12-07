'use strict';

var _extends = require('babel-runtime/helpers/extends')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _sshExec = require('ssh-exec');

var _sshExec2 = _interopRequireDefault(_sshExec);

var _utilsConfig_utils = require('../../utils/config_utils');

var _configsDirectories = require('../../configs/directories');

var _utilsPass_utils = require('../../utils/pass_utils');

var _packageJson = require('../../../package.json');

var _uiAction_title = require('../../ui/action_title');

var _uiAction_title2 = _interopRequireDefault(_uiAction_title);

var CONFIGFILE = '.catladder.yaml';

exports['default'] = function (environment, done) {
  (0, _uiAction_title2['default'])('apply config ' + environment);
  var config = (0, _utilsConfig_utils.readConfig)();
  var passPathForEnvVars = (0, _configsDirectories.passEnvFile)({ config: config, environment: environment });
  // load changed envVars and create env.sh on server
  // we create ROOT_URL always from the config
  var envConfig = config[environment];
  var envSh = (0, _utilsConfig_utils.createEnvSh)({ version: _packageJson.version, environment: environment }, _extends({}, (0, _utilsPass_utils.readPassYaml)(passPathForEnvVars), {
    ROOT_URL: envConfig.url
  }));
  // create env.sh on server
  (0, _sshExec2['default'])('echo "' + envSh.replace(/"/g, '\\"') + '" > ~/app/env.sh', (0, _utilsConfig_utils.getSshConfig)(CONFIGFILE, environment), function (err) {
    if (err) {
      throw err;
    }
    console.log('');
    console.log('~/app/env.sh has ben written on ', envConfig.host);
    done(null, environment + ' is set up, please restart server');
  }).pipe(process.stdout);
};

module.exports = exports['default'];
//# sourceMappingURL=applyConfig.js.map