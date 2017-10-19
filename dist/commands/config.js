'use strict';

var _extends = require('babel-runtime/helpers/extends')['default'];

var _defineProperty = require('babel-runtime/helpers/define-property')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _prompt = require('prompt');

var _prompt2 = _interopRequireDefault(_prompt);

var _sshExec = require('ssh-exec');

var _sshExec2 = _interopRequireDefault(_sshExec);

var _jsYaml = require('js-yaml');

var _jsYaml2 = _interopRequireDefault(_jsYaml);

var _configsPrompt_schemas = require('../configs/prompt_schemas');

var _utilsConfig_utils = require('../utils/config_utils');

var _configsDirectories = require('../configs/directories');

var _packageJson = require('../../package.json');

var _utilsPass_utils = require('../utils/pass_utils');

var _uiAction_title = require('../ui/action_title');

var _uiAction_title2 = _interopRequireDefault(_uiAction_title);

var _configsDefault_env = require('../configs/default_env');

var _configsDefault_env2 = _interopRequireDefault(_configsDefault_env);

var CONFIGFILE = '.catladder.yaml';

exports['default'] = function (environment, done) {
  var config = (0, _utilsConfig_utils.readConfig)();
  _prompt2['default'].start();

  (0, _uiAction_title2['default'])('setting up ' + environment);
  var passPathForEnvVars = (0, _configsDirectories.passEnvFile)({ config: config, environment: environment });
  // console.log(passPathForEnvVars);
  var oldEnvConfig = _lodash2['default'].get(config, ['environments', environment], {});
  _prompt2['default'].get((0, _configsPrompt_schemas.environmentSchema)(_extends({}, config, { environment: environment })), function (error, envConfig) {
    // write new envConfig
    config.environments = _extends({}, config.environments, _defineProperty({}, environment, _extends({}, oldEnvConfig, envConfig)));
    (0, _utilsConfig_utils.writeConfig)(CONFIGFILE, config);
    // update env-vars in path
    // first get current vars in path
    var envVars = (0, _utilsPass_utils.readPassYaml)(passPathForEnvVars);
    // if envVars do not exist yet, create new one and write to pass
    if (_lodash2['default'].isEmpty(envVars)) {
      envVars = (0, _configsDefault_env2['default'])({ config: config, envConfig: envConfig });
      (0, _utilsPass_utils.writePass)(passPathForEnvVars, _jsYaml2['default'].safeDump(envVars));
    }
    // open editor to edit the en vars
    (0, _utilsPass_utils.editPass)(passPathForEnvVars);
    // load changed envVars and create env.sh on server
    // we create ROOT_URL always from the config
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
  });
};

module.exports = exports['default'];
// merge with old config
//# sourceMappingURL=config.js.map