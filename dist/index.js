'use strict';

var _extends = require('babel-runtime/helpers/extends')['default'];

var _defineProperty = require('babel-runtime/helpers/define-property')['default'];

var _toArray = require('babel-runtime/helpers/to-array')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

var _minimist = require('minimist');

var _minimist2 = _interopRequireDefault(_minimist);

var _prompt = require('prompt');

var _prompt2 = _interopRequireDefault(_prompt);

var _sshExec = require('ssh-exec');

var _sshExec2 = _interopRequireDefault(_sshExec);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _jsYaml = require('js-yaml');

var _jsYaml2 = _interopRequireDefault(_jsYaml);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _child_process = require('child_process');

var _packageJson = require('../package.json');

var CONFIGFILE = '.catladder.yaml';
var options = (0, _minimist2['default'])(process.argv.slice(2));
var writeConfig = function writeConfig(config) {
  return _fs2['default'].writeFile(CONFIGFILE, _jsYaml2['default'].safeDump(config), function (err) {
    if (err) {
      return console.log(err);
    }
  });
};
var readConfig = function readConfig() {
  return _jsYaml2['default'].safeLoad(_fs2['default'].readFileSync(CONFIGFILE));
};
var readPass = function readPass(path) {
  try {
    return (0, _child_process.execSync)('pass show ' + path, { stdio: [0], encoding: 'utf-8' });
  } catch (error) {
    if (error.message.indexOf('is not in the password store') !== -1) {
      return null;
    }
    throw error;
  }
};

var writePass = function writePass(path, input) {
  console.log('writing to pass', path);
  (0, _child_process.execSync)('pass insert ' + path + ' -m', { input: input });
};

var editPass = function editPass(path) {
  (0, _child_process.spawnSync)('pass', ['edit', path], {
    stdio: 'inherit'
  });
};
var initSchema = {
  properties: {
    customer: {
      description: 'Customer kürzel',
      required: true,
      'default': 'pan'
    },
    appname: {
      description: 'App name (for dbs, filenames, etc.)',
      type: 'string',
      required: true,
      pattern: /^[a-zA-Z]+$/
    },
    passPath: {
      description: 'Path in pass',
      required: true,
      'default': function _default() {
        return _prompt2['default'].history('customer').value + '/' + _prompt2['default'].history('appname').value;
      }
    },
    environments: {
      description: 'environments',
      type: 'string',
      required: true,
      pattern: /^[a-z,\s]+$/,
      'default': 'staging, production',
      before: function before(v) {
        return v.split(',').map(_lodash2['default'].trim);
      }
    }
  }
};

var environmentSchema = function environmentSchema(_ref) {
  var environment = _ref.environment;
  var appname = _ref.appname;
  return {
    properties: {
      host: {
        description: 'ssh host',
        type: 'string',
        required: true,
        'default': appname + '-' + environment + '.panter.biz'
      },
      user: {
        description: 'ssh user',
        'default': 'app'
      },
      url: {
        description: 'full url',
        'default': function _default() {
          return 'https://' + _prompt2['default'].history('host').value;
        }
      }
    }
  };
};

var defaultEnv = function defaultEnv(_ref2) {
  var config = _ref2.config;
  var envConfig = _ref2.envConfig;
  return {
    PORT: 8080,
    MONGO_URL: 'mongodb://localhost/' + config.appname,
    MONGO_OPLOG_URL: 'mongodb://localhost/local',
    MAIL_URL: 'smtp://localhost:25',
    ROOT_URL: envConfig.url,
    METEOR_SETTINGS: {}
  };
};

var withDefaults = function withDefaults(schema) {
  var defaults = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
  return _extends({}, schema, {
    properties: _lodash2['default'].mapValues(schema.properties, function (value, key) {
      return _extends({}, value, {
        'default': function _default() {
          return defaults[key] || _lodash2['default'].result(value, 'default');
        }
      });
    })
  });
};

var createEnvSh = function createEnvSh(envVars) {
  var getSanitziedValue = function getSanitziedValue(value) {
    if (_lodash2['default'].isObject(value)) {
      return JSON.stringify(value);
    }
    return value;
  };
  return _lodash2['default'].keys(envVars).map(function (key) {
    var value = getSanitziedValue(envVars[key]);
    return 'export ' + key + '=\'' + value + '\'';
  }).join('\n');
};

var actions = {
  init: function init() {
    var config = _fs2['default'].existsSync(CONFIGFILE) && readConfig() || {};
    _prompt2['default'].start();
    _prompt2['default'].get(withDefaults(initSchema, config), function (error, _ref3) {
      var customer = _ref3.customer;
      var appname = _ref3.appname;
      var passPath = _ref3.passPath;
      var environments = _ref3.environments;

      var configFile = {
        appname: appname,
        customer: customer,
        passPath: passPath,
        environments: _lodash2['default'].chain(environments).keyBy().mapValues(function () {
          return {};
        }).value()
      };
      writeConfig(configFile);
      console.log('created ' + CONFIGFILE);
    });
  },
  setup: function setup(environments) {
    var config = readConfig();
    _prompt2['default'].start();
    environments.forEach(function (environment) {
      console.log('setting up', environment);
      var passPathForEnvVars = config.passPath + '/' + environment + '.yaml';
      // console.log(passPathForEnvVars);
      _prompt2['default'].get(environmentSchema(_extends({}, config, { environment: environment })), function (error, envConfig) {
        // write envConfig
        writeConfig(_extends({}, config, _defineProperty({}, environment, envConfig)));
        var envVars = _jsYaml2['default'].safeLoad(readPass(passPathForEnvVars));

        if (_lodash2['default'].isEmpty(envVars)) {
          envVars = defaultEnv({ config: config, envConfig: envConfig });
          writePass(passPathForEnvVars, _jsYaml2['default'].safeDump(envVars));
        }

        editPass(passPathForEnvVars);
        var envSh = createEnvSh(_jsYaml2['default'].safeLoad(readPass(passPathForEnvVars)));
        // create env.sh on server
        var sshConf = _lodash2['default'].pick(envConfig, ['host', 'user', 'password', 'key']);
        (0, _sshExec2['default'])('echo "' + envSh + '" > ~/app/env.sh', sshConf);
        console.log('~/app/env.sh has ben written on ', envConfig.host);
        console.log('you need to restart the server');
      });
    });
  },
  restart: function restart(environments) {
    var config = readConfig();
    environments.forEach(function (environment) {
      console.log(config, environment);
      (0, _sshExec2['default'])('');
    });
  }

};

var _options$_ = _toArray(options._);

var command = _options$_[0];

var args = _options$_.slice(1);

console.log('');
console.log('                                🐱 🔧');
console.log('         ╔═══ PANTER CATLADDER ═════');
console.log('       ╔═╝');
console.log('     ╔═╝          v' + _packageJson.version);
console.log('   ╔═╝');
console.log(' ╔═╝');
console.log('═╝');
console.log('');
if (actions[command]) {
  actions[command](args);
}
//# sourceMappingURL=index.js.map