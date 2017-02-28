'use strict';

var _extends = require('babel-runtime/helpers/extends')['default'];

var _defineProperty = require('babel-runtime/helpers/define-property')['default'];

var _slicedToArray = require('babel-runtime/helpers/sliced-to-array')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _camelcase = require('camelcase');

var _camelcase2 = _interopRequireDefault(_camelcase);

var _minimist = require('minimist');

var _minimist2 = _interopRequireDefault(_minimist);

var _prompt = require('prompt');

var _prompt2 = _interopRequireDefault(_prompt);

var _sshExec = require('ssh-exec');

var _sshExec2 = _interopRequireDefault(_sshExec);

var _jsYaml = require('js-yaml');

var _jsYaml2 = _interopRequireDefault(_jsYaml);

var _child_process = require('child_process');

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _config_utils = require('./config_utils');

var _android_build = require('./android_build');

var _prompt_schemas = require('./prompt_schemas');

var _logs = require('./logs');

var _packageJson = require('../package.json');

var _pass_utils = require('./pass_utils');

var getIosBuildDir = function getIosBuildDir(config, environment) {
  return _path2['default'].resolve(config.buildDir + '/' + environment + '/ios');
};
var getIosProjectFile = function getIosProjectFile(config, environment) {
  return getIosBuildDir(config, environment) + '/project';
};
var CONFIGFILE = '.catladder.yaml';
var options = (0, _minimist2['default'])(process.argv.slice(2));

var defaultEnv = function defaultEnv(_ref) {
  var config = _ref.config;
  var envConfig = _ref.envConfig;
  return {
    PORT: 8080,
    MONGO_URL: 'mongodb://localhost/' + config.appname,
    MONGO_OPLOG_URL: 'mongodb://localhost/local',
    MAIL_URL: 'smtp://localhost:25',
    ROOT_URL: envConfig.url,
    METEOR_SETTINGS: {}
  };
};

var actions = {
  init: function init(__, done) {
    var configOld = _fs2['default'].existsSync(CONFIGFILE) && (0, _config_utils.readConfig)(CONFIGFILE) || {};
    _prompt2['default'].start();
    _prompt2['default'].get((0, _prompt_schemas.initSchema)(configOld), function (error, configNew) {
      var config = _extends({}, configOld, configNew);
      (0, _config_utils.writeConfig)(CONFIGFILE, config);
      var buildDir = _path2['default'].resolve(config.buildDir);
      if (!_fs2['default'].existsSync(buildDir)) {
        _fs2['default'].mkdirSync(buildDir);
      }
      done(null, 'created ' + CONFIGFILE);
    });
  },
  setup: function setup(environment, done) {
    var config = (0, _config_utils.readConfig)(CONFIGFILE);
    _prompt2['default'].start();

    (0, _logs.actionTitle)('setting up ' + environment);
    var passPathForEnvVars = config.passPath + '/' + environment + '/env.yaml';
    // console.log(passPathForEnvVars);
    _prompt2['default'].get((0, _prompt_schemas.environmentSchema)(_extends({}, config, { environment: environment })), function (error, envConfig) {
      // write new envConfig
      config.environments = _extends({}, config.environments, _defineProperty({}, environment, _extends({}, envConfig, {
        envVarsPassPath: passPathForEnvVars
      })));

      (0, _config_utils.writeConfig)(CONFIGFILE, _extends({}, config, {
        environments: _extends({}, config.environments, _defineProperty({}, environment, envConfig))
      }));
      // update env-vars in path
      // first get current vars in path
      var envVars = (0, _pass_utils.readPassYaml)(passPathForEnvVars);
      // if envVars do not exist yet, create new one and write to pass
      if (_lodash2['default'].isEmpty(envVars)) {
        envVars = defaultEnv({ config: config, envConfig: envConfig });
        (0, _pass_utils.writePass)(passPathForEnvVars, _jsYaml2['default'].safeDump(envVars));
      }
      // open editor to edit the en vars
      (0, _pass_utils.editPass)(passPathForEnvVars);
      // load changed envVars and create env.sh on server
      var envSh = (0, _config_utils.createEnvSh)({ version: _packageJson.version, environment: environment }, (0, _pass_utils.readPassYaml)(passPathForEnvVars));
      // create env.sh on server
      (0, _sshExec2['default'])('echo "' + envSh.replace(/"/g, '\\"') + '" > ~/app/env.sh', (0, _config_utils.getSshConfig)(CONFIGFILE, environment), function (err) {
        if (err) {
          throw err;
        }
        console.log('');
        console.log('~/app/env.sh has ben written on ', envConfig.host);
        done(null, environment + ' is set up, please restart server');
      }).pipe(process.stdout);
    });
  },
  restart: function restart(environment, done) {
    (0, _logs.actionTitle)('restarting ' + environment);
    (0, _sshExec2['default'])('./bin/nodejs.sh restart', (0, _config_utils.getSshConfig)(CONFIGFILE, environment), function () {
      done(null, 'server restarted');
    }).pipe(process.stdout);
  },
  buildServer: function buildServer(environment, done) {
    var config = (0, _config_utils.readConfig)(CONFIGFILE);
    var envConf = config.environments[environment];
    var buildDir = _path2['default'].resolve(config.buildDir + '/' + environment);
    (0, _logs.actionTitle)('building server ' + environment);
    console.log('build dir: ' + buildDir);
    (0, _child_process.execSync)('meteor npm install', { cwd: config.appDir, stdio: 'inherit' });
    (0, _child_process.execSync)('meteor build --server-only --server ' + envConf.url + ' ' + buildDir, { cwd: config.appDir, stdio: 'inherit' });
    done(null, 'server built');
  },
  buildApps: function buildApps(environment, done) {
    var config = (0, _config_utils.readConfig)(CONFIGFILE);
    var envConf = config.environments[environment];
    var buildDir = _path2['default'].resolve(config.buildDir + '/' + environment);
    (0, _logs.actionTitle)('building mobile apps ' + environment);
    console.log('build dir: ' + buildDir);
    (0, _child_process.execSync)('meteor npm install', { cwd: config.appDir, stdio: 'inherit' });
    (0, _child_process.execSync)('meteor build --server ' + envConf.url + ' ' + buildDir, { cwd: config.appDir, stdio: 'inherit' });

    // open ios project if exists

    // init android if it exists
    if (_fs2['default'].existsSync((0, _android_build.getAndroidBuildDir)(config, environment))) {
      actions.prepareAndroidForStore(environment, done);
    } else {
      done(null, 'apps created in ' + buildDir);
    }
  },
  openIosProject: function openIosProject(environment, done) {
    var config = (0, _config_utils.readConfig)(CONFIGFILE);
    if (_fs2['default'].existsSync(getIosProjectFile(config, environment))) {
      (0, _child_process.execSync)('open ' + getIosProjectFile(config, environment));
    } else {
      done(null, 'ios project does not exist under ' + getIosProjectFile(config, environment));
    }
  },
  prepareAndroidForStore: function prepareAndroidForStore(environment, done) {
    var config = (0, _config_utils.readConfig)(CONFIGFILE);
    var outfile = (0, _android_build.prepareAndroidForStore)(config, environment);
    done(null, 'your apk is ready: ' + outfile);
  },
  initAndroid: function initAndroid(environment, done) {
    var config = (0, _config_utils.readConfig)(CONFIGFILE);
    (0, _android_build.initAndroid)(config, environment);
    done(null, 'android is init');
  },
  uploadServer: function uploadServer(environment, done) {
    var next = function next() {
      return actions.restart(environment, done);
    };
    var config = (0, _config_utils.readConfig)(CONFIGFILE);

    // const envConf = config.environments[environment];
    var sshConfig = (0, _config_utils.getSshConfig)(CONFIGFILE, environment);
    (0, _logs.actionTitle)('uploading server bundle to ' + environment);
    (0, _child_process.execSync)('scp ' + config.buildDir + '/' + environment + '/app.tar.gz ' + sshConfig.user + '@' + sshConfig.host + ':', { stdio: 'inherit' });
    (0, _sshExec2['default'])('\n        rm -rf ~/app/last\n        mv ~/app/bundle ~/app/last\n        tar xfz app.tar.gz -C app\n        pushd ~/app/bundle/programs/server\n        npm install\n        popd\n      ', sshConfig, next).pipe(process.stdout);
  },
  deploy: function deploy(environment, done) {
    (0, _logs.actionTitle)('deploying ' + environment);
    actions.buildServer(environment, function () {
      actions.uploadServer(environment, done);
    });
  }

};

var _options$_ = _slicedToArray(options._, 2);

var commandRaw = _options$_[0];
var environment = _options$_[1];

var command = commandRaw && (0, _camelcase2['default'])(commandRaw);

(0, _logs.intro)('');
(0, _logs.intro)('                                   🐱 🔧');
(0, _logs.intro)('         ╔═════ PANTER CATLADDER ════════');
(0, _logs.intro)('       ╔═╝');
(0, _logs.intro)('     ╔═╝           v' + _packageJson.version);
(0, _logs.intro)('   ╔═╝');
(0, _logs.intro)(' ╔═╝');
(0, _logs.intro)('═╝');
(0, _logs.intro)('');

var doneSuccess = function doneSuccess(message) {
  (0, _logs.intro)('');
  (0, _logs.intro)('');
  (0, _logs.intro)('╗');
  (0, _logs.intro)('╚═╗ ' + message + '  👋 🐱');
  (0, _logs.intro)('  ╚════════════════════════════════════════════════');
};

var doneError = function doneError(error, message) {
  (0, _logs.intro)('');
  (0, _logs.intro)('');
  (0, _logs.intro)('╗ 🙀  ' + message + '  😿');
  (0, _logs.intro)('╚══════════════════════════════════════════════════');
  (0, _logs.intro)('😾         🐁 🐁 🐁 🐁 🐁 🐁');
  console.log('' + (error && (error.message || error.reason)));
  (0, _logs.intro)('');
  console.log(error && error.stack);
  (0, _logs.intro)('═══════════════════════════════════════════════════');
};

var done = function done(error, message) {
  if (!error) {
    doneSuccess(message);
  } else {
    doneError(error, message);
  }
};

if (actions[command]) {
  if (command !== 'init' && !environment) {
    doneError(null, 'please specify an environment');
  } else {
    try {
      actions[command](environment, done);
    } catch (e) {
      done(e, 'command failed');
    }
  }
} else {
  console.log('available commands: ');
  console.log('');
  console.log(_lodash2['default'].keys(actions).join('\n'));
  done();
}
//# sourceMappingURL=catladder.js.map