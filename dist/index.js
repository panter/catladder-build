'use strict';

var _extends = require('babel-runtime/helpers/extends')['default'];

var _toArray = require('babel-runtime/helpers/to-array')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

var _minimist = require('minimist');

var _minimist2 = _interopRequireDefault(_minimist);

var _prompt = require('prompt');

var _prompt2 = _interopRequireDefault(_prompt);

// import remoteExec from 'ssh-exec';

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _jsYaml = require('js-yaml');

var _jsYaml2 = _interopRequireDefault(_jsYaml);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _child_process = require('child_process');

var options = (0, _minimist2['default'])(process.argv.slice(2));
var writeConfig = function writeConfig(config) {
  return _fs2['default'].writeFile('.catladder.yaml', _jsYaml2['default'].safeDump(config), function (err) {
    if (err) {
      return console.log(err);
    }
  });
};
var readConfig = function readConfig() {
  return _jsYaml2['default'].safeLoad(_fs2['default'].readFileSync('.catladder.yaml'));
};
var readPass = function readPass(path) {
  try {
    return (0, _child_process.execSync)('pass show ' + path, { stdio: [0] });
  } catch (error) {
    if (error.message.indexOf('is not in the password store') !== -1) {
      return null;
    }
    throw error;
  }
};

var writePass = function writePass(path, content) {
  return (0, _child_process.execSync)('pass insert ' + path, { stdin: content });
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
      sshHost: {
        description: 'ssh host',
        type: 'string',
        required: true,
        'default': appname + '-' + environment + '.panter.biz'
      },
      sshUsername: {
        description: 'ssh user',
        'default': 'app'
      },
      url: {
        description: 'full url',
        'default': function _default() {
          return 'https://' + _prompt2['default'].history('sshHost').value;
        }
      }
    }
  };
};

var envVarsSchema = function envVarsSchema(_ref2) {
  var config = _ref2.config;
  var envConfig = _ref2.envConfig;
  return {
    properties: {
      PORT: {
        required: true,
        pattern: /^[0-9]+$/,
        'default': 8080
      },
      MONGO_URL: {
        required: true,
        'default': 'mongodb://localhost/' + config.appname
      },
      MONGO_OPLOG_URL: {
        required: true,
        'default': 'mongodb://localhost/local'
      },
      MAIL_URL: {
        required: true,
        'default': 'smtp://localhost:25'
      },
      ROOT_URL: {
        required: true,
        'default': envConfig.url
      }
    }
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

var actions = {
  init: function init() {
    _prompt2['default'].start();
    _prompt2['default'].get(initSchema, function (error, _ref3) {
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
      console.log('writing');
      console.log(writeConfig(configFile));
    });
  },
  setup: function setup(environments) {
    var config = readConfig();
    console.log(environments);
    _prompt2['default'].start();
    environments.forEach(function (environment) {
      var passPathForEnvVars = config.passPath + '/' + environment;
      // console.log(passPathForEnvVars);

      var envVarsOld = readPass(passPathForEnvVars) || {};

      _prompt2['default'].get(environmentSchema(_extends({}, config, { environment: environment })), function (error, envConfig) {
        //

        _prompt2['default'].get(withDefaults(envVarsSchema({ config: config, envConfig: envConfig, environment: environment }), envVarsOld), function (varsError, envVars) {
          if (varsError) {
            throw varsError;
          }
          writePass(passPathForEnvVars, envVars);
          // create env object, should be flat key value
          var envVarsSanitized = _lodash2['default'].mapValues(envVars, function (envVar) {
            if (_lodash2['default'].isObject(envVar)) {
              return JSON.stringify(envVar);
            }
            return envVar;
          });

          console.log(envVarsSanitized);
        });
      });
    });
  }

};

var _options$_ = _toArray(options._);

var command = _options$_[0];

var environments = _options$_.slice(1);

if (actions[command]) {
  actions[command](environments);
}
//# sourceMappingURL=index.js.map