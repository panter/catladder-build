'use strict';

var _extends = require('babel-runtime/helpers/extends')['default'];

var _defineProperty = require('babel-runtime/helpers/define-property')['default'];

var _objectWithoutProperties = require('babel-runtime/helpers/object-without-properties')['default'];

var _slicedToArray = require('babel-runtime/helpers/sliced-to-array')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

var _minimist = require('minimist');

var _minimist2 = _interopRequireDefault(_minimist);

var _prompt = require('prompt');

var _prompt2 = _interopRequireDefault(_prompt);

var _colorsSafe = require('colors/safe');

var _colorsSafe2 = _interopRequireDefault(_colorsSafe);

var _sshExec = require('ssh-exec');

var _sshExec2 = _interopRequireDefault(_sshExec);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _jsYaml = require('js-yaml');

var _jsYaml2 = _interopRequireDefault(_jsYaml);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _child_process = require('child_process');

var _packageJson = require('../package.json');

var intro = function intro(line) {
  return console.log(_colorsSafe2['default'].yellow(line));
};
var actionTitle = function actionTitle(title) {
  intro('');
  intro('🐱 🔧 ' + title);
  intro('');
};

var CONFIGFILE = '.catladder.yaml';
var options = (0, _minimist2['default'])(process.argv.slice(2));
var writeConfig = function writeConfig(config) {
  var theyaml = _jsYaml2['default'].safeDump(config);
  _fs2['default'].writeFileSync(CONFIGFILE, theyaml);
};
var readConfig = function readConfig() {
  return _jsYaml2['default'].safeLoad(_fs2['default'].readFileSync(CONFIGFILE));
};
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

var writePass = function writePass(passPath, input) {
  console.log('writing to pass', passPath);
  (0, _child_process.execSync)('pass insert ' + _path2['default'] + ' -m', { input: input });
};

var editPass = function editPass(passPath) {
  (0, _child_process.spawnSync)('pass', ['edit', passPath], {
    stdio: 'inherit'
  });
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

var initSchema = function initSchema(config) {
  return withDefaults({
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
      appDir: {
        description: 'app directory',
        type: 'string',
        'default': './app'
      },
      buildDir: {
        description: 'build directory',
        type: 'string',
        'default': './build'
      }
    }
  }, config);
};

var environmentSchema = function environmentSchema(_ref) {
  var environment = _ref.environment;
  var appname = _ref.appname;

  var config = _objectWithoutProperties(_ref, ['environment', 'appname']);

  return withDefaults({
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
  }, config[environment]);
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

var getSshConfig = function getSshConfig(environment) {
  var config = readConfig();
  return _lodash2['default'].pick(config.environments[environment], ['host', 'user', 'password', 'key']);
};

var actions = {
  init: function init(__, done) {
    var configOld = _fs2['default'].existsSync(CONFIGFILE) && readConfig() || {};
    _prompt2['default'].start();
    _prompt2['default'].get(initSchema(configOld), function (error, configNew) {
      var config = _extends({}, configOld, configNew);
      writeConfig(config);
      var buildDir = _path2['default'].resolve(config.buildDir);
      if (!_fs2['default'].existsSync(buildDir)) {
        _fs2['default'].mkdirSync(buildDir);
      }
      console.log('created ' + CONFIGFILE);
      done();
    });
  },
  setup: function setup(environments, done) {
    var config = readConfig();
    _prompt2['default'].start();
    environments.forEach(function (environment) {
      actionTitle('setting up ' + environment);
      var passPathForEnvVars = config.passPath + '/' + environment + '.yaml';
      // console.log(passPathForEnvVars);
      _prompt2['default'].get(environmentSchema(_extends({}, config, { environment: environment })), function (error, envConfig) {
        // write new envConfig
        config.environments = _extends({}, config.environments, _defineProperty({}, environment, envConfig));

        writeConfig(_extends({}, config, {
          environments: _extends({}, config.environments, _defineProperty({}, environment, envConfig))
        }));
        // update env-vars in path
        // first get current vars in path
        var envVars = _jsYaml2['default'].safeLoad(readPass(passPathForEnvVars));
        // if envVars do not exist yet, create new one and write to pass
        if (_lodash2['default'].isEmpty(envVars)) {
          envVars = defaultEnv({ config: config, envConfig: envConfig });
          writePass(passPathForEnvVars, _jsYaml2['default'].safeDump(envVars));
        }
        // open editor to edit the en vars
        editPass(passPathForEnvVars);
        // load changed envVars and create env.sh on server
        var envSh = createEnvSh(_jsYaml2['default'].safeLoad(readPass(passPathForEnvVars)));
        // create env.sh on server
        (0, _sshExec2['default'])('echo "' + envSh.replace(/"/g, '\\"') + '" > ~/app/env.sh', getSshConfig(environment), function (err) {
          if (err) {
            throw err;
          }
          console.log('');
          console.log('~/app/env.sh has ben written on ', envConfig.host);
          console.log('you need to restart the server');
          done();
        }).pipe(process.stdout);
      });
    });
  },
  restart: function restart(environment, done) {
    actionTitle('restarting ' + environment);
    (0, _sshExec2['default'])('./bin/nodejs.sh restart', getSshConfig(environment), done).pipe(process.stdout);
  },
  build: function build(environment, done) {
    var config = readConfig();

    var envConf = config.environments[environment];
    var buildDir = _path2['default'].resolve(config.buildDir + '/' + environment);
    actionTitle('building ' + environment);
    console.log('build dir: ' + buildDir);
    (0, _child_process.execSync)('meteor npm install', { cwd: config.appDir, stdio: [0, 1, 2] });
    (0, _child_process.execSync)('meteor build --server ' + envConf.url + ' ' + buildDir, { cwd: config.appDir, stdio: [0, 1, 2] });
    done();
  },
  deploy: function deploy(environment, done) {
    var next = function next() {
      return actions.restart(environment, done);
    };
    var config = readConfig();

    // const envConf = config.environments[environment];
    var sshConfig = getSshConfig(environment);
    actionTitle('deploying ' + environment);
    (0, _child_process.execSync)('scp ' + config.buildDir + '/' + environment + '/app.tar.gz ' + sshConfig.user + '@' + sshConfig.host + ':', { stdio: [0, 1, 2] });
    (0, _sshExec2['default'])('\n        rm -rf ~/app/last\n        mv ~/app/bundle ~/app/last\n        tar xfz app.tar.gz -C app\n        pushd ~/app/bundle/programs/server\n        npm install\n        popd\n      ', sshConfig, next).pipe(process.stdout);
  },
  'build-deploy': function buildDeploy(environment, done) {
    actions.build(environment, function () {
      actions.deploy(environment, done);
    });
  }

};

var _options$_ = _slicedToArray(options._, 2);

var command = _options$_[0];
var environment = _options$_[1];

intro('');
intro('                                🐱 🔧');
intro('         ╔═══ PANTER CATLADDER ═════');
intro('       ╔═╝');
intro('     ╔═╝          v' + _packageJson.version);
intro('   ╔═╝');
intro(' ╔═╝');
intro('═╝');
intro('');

var done = function done() {
  intro('');
  intro('╗');
  intro('╚═╗                      👋 🐱');
  intro('  ╚══════════════════════════════════');
};
if (actions[command]) {
  actions[command](environment, done);
} else {
  console.log('available commands: ');
  console.log('');
  console.log(_lodash2['default'].keys(actions).join('\n'));
  done();
}
//# sourceMappingURL=catladder.js.map