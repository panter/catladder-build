'use strict';

var _extends = require('babel-runtime/helpers/extends')['default'];

var _defineProperty = require('babel-runtime/helpers/define-property')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _prompt = require('prompt');

var _prompt2 = _interopRequireDefault(_prompt);

var _sshExec = require('ssh-exec');

var _sshExec2 = _interopRequireDefault(_sshExec);

var _rimraf = require('rimraf');

var _rimraf2 = _interopRequireDefault(_rimraf);

var _jsYaml = require('js-yaml');

var _jsYaml2 = _interopRequireDefault(_jsYaml);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _child_process = require('child_process');

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _buildAndroid_build = require('../build/android_build');

var _utilsGit_utils = require('../utils/git_utils');

var _utilsConfig_utils = require('../utils/config_utils');

var _configsPrompt_schemas = require('../configs/prompt_schemas');

var _configsDirectories = require('../configs/directories');

var _packageJson = require('../../package.json');

var _utilsPass_utils = require('../utils/pass_utils');

var _uiAction_title = require('../ui/action_title');

var _uiAction_title2 = _interopRequireDefault(_uiAction_title);

var _configsDefault_env = require('../configs/default_env');

var _configsDefault_env2 = _interopRequireDefault(_configsDefault_env);

var _buildExec_meteor_build = require('../build/exec_meteor_build');

var _buildExec_meteor_build2 = _interopRequireDefault(_buildExec_meteor_build);

var CONFIGFILE = '.catladder.yaml';

var getFullVersionString = function getFullVersionString(env) {
  return env + '-' + (0, _utilsGit_utils.getTagFromGit)() + '@' + (0, _utilsGit_utils.getBuildNumberFromGit)();
};

var actions = {
  init: function init(__, done) {
    var configOld = _fs2['default'].existsSync(CONFIGFILE) && (0, _utilsConfig_utils.readConfig)(CONFIGFILE) || {};
    _prompt2['default'].start();
    _prompt2['default'].get((0, _configsPrompt_schemas.initSchema)(configOld), function (error, configNew) {
      var config = _extends({}, configOld, configNew);
      (0, _utilsConfig_utils.writeConfig)(CONFIGFILE, config);
      var buildDir = _path2['default'].resolve(config.buildDir);
      if (!_fs2['default'].existsSync(buildDir)) {
        _fs2['default'].mkdirSync(buildDir);
      }
      done(null, 'created ' + CONFIGFILE);
    });
  },
  setup: function setup(environment, done) {
    var config = (0, _utilsConfig_utils.readConfig)(CONFIGFILE);
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
  },
  editEnv: function editEnv(environment, done) {
    var config = (0, _utilsConfig_utils.readConfig)(CONFIGFILE);
    var passPathForEnvVars = (0, _configsDirectories.passEnvFile)({ config: config, environment: environment });
    (0, _utilsPass_utils.editPass)(passPathForEnvVars);
    done(null, 'env in pass edited. Remember that this not updates the server. Use catladder setup <env> to do so');
  },
  restart: function restart(environment, done) {
    (0, _uiAction_title2['default'])('restarting ' + environment);
    (0, _sshExec2['default'])('./bin/nodejs.sh restart', (0, _utilsConfig_utils.getSshConfig)(CONFIGFILE, environment), function () {
      done(null, 'server restarted');
    }).pipe(process.stdout);
  },
  buildServer: function buildServer(environment, done) {
    var config = (0, _utilsConfig_utils.readConfig)(CONFIGFILE);
    // read build params
    (0, _uiAction_title2['default'])('building server ' + getFullVersionString(environment));

    (0, _buildExec_meteor_build2['default'])({ config: config, environment: environment }, ['--server-only']);
    done(null, 'server built');
  },
  buildApps: function buildApps(environment, done) {
    var config = (0, _utilsConfig_utils.readConfig)(CONFIGFILE);
    var buildDir = (0, _configsDirectories.getBuildDir)({ config: config, environment: environment });
    (0, _uiAction_title2['default'])('building mobile apps ' + getFullVersionString(environment));
    console.log('build dir: ' + buildDir);

    // remove project folders if existing
    // otherwise apps might get bloated with old code
    if (_fs2['default'].existsSync((0, _buildAndroid_build.getAndroidBuildProjectFolder)({ config: config, environment: environment }))) {
      _rimraf2['default'].sync((0, _buildAndroid_build.getAndroidBuildProjectFolder)({ config: config, environment: environment }));
    }
    if (_fs2['default'].existsSync((0, _configsDirectories.getIosBuildProjectFolder)({ config: config, environment: environment }))) {
      _rimraf2['default'].sync((0, _configsDirectories.getIosBuildProjectFolder)({ config: config, environment: environment }));
    }

    (0, _buildExec_meteor_build2['default'])({ config: config, environment: environment });

    // open ios project if exists
    actions.iosRevealProject(environment, config);

    // init android if it exists
    if (_fs2['default'].existsSync((0, _buildAndroid_build.getAndroidBuildDir)({ config: config, environment: environment }))) {
      actions.androidPrepareForStore(environment, done);
    } else {
      done(null, 'apps created in ' + buildDir);
    }
  },
  iosRevealProject: function iosRevealProject(environment, done) {
    var config = (0, _utilsConfig_utils.readConfig)(CONFIGFILE);
    if (_fs2['default'].existsSync((0, _configsDirectories.getIosBuildProjectFolder)({ config: config, environment: environment }))) {
      (0, _child_process.execSync)('open ' + (0, _configsDirectories.getIosBuildProjectFolder)({ config: config, environment: environment }));
    } else {
      done(null, 'ios project does not exist under ' + (0, _configsDirectories.getIosBuildProjectFolder)({ config: config, environment: environment }));
    }
  },
  androidPrepareForStore: function androidPrepareForStore(environment, done) {
    var config = (0, _utilsConfig_utils.readConfig)(CONFIGFILE);
    var outfile = (0, _buildAndroid_build.androidPrepareForStore)({ config: config, environment: environment });
    done(null, 'your apk is ready: ' + outfile);
  },
  androidInit: function androidInit(environment, done) {
    var config = (0, _utilsConfig_utils.readConfig)(CONFIGFILE);
    (0, _buildAndroid_build.androidInit)({ config: config, environment: environment });
    done(null, 'android is init');
  },
  uploadServer: function uploadServer(environment, done) {
    var next = function next() {
      return actions.restart(environment, done);
    };
    var config = (0, _utilsConfig_utils.readConfig)(CONFIGFILE);
    // const envConf = config.environments[environment];
    var sshConfig = (0, _utilsConfig_utils.getSshConfig)(CONFIGFILE, environment);
    (0, _uiAction_title2['default'])('uploading server bundle to ' + environment);
    var buildDir = (0, _configsDirectories.getBuildDir)({ config: config, environment: environment });
    (0, _child_process.execSync)('scp ' + buildDir + '/app.tar.gz ' + sshConfig.user + '@' + sshConfig.host + ':', { stdio: 'inherit' });
    (0, _sshExec2['default'])('\n        rm -rf ~/app/last\n        mv ~/app/bundle ~/app/last\n        rm ~/app/current\n        ln -s ~/app/bundle ~/app/current\n        tar xfz app.tar.gz -C app\n        pushd ~/app/bundle/programs/server\n        npm install\n        popd\n      ', sshConfig, next).pipe(process.stdout);
  },
  deploy: function deploy(environment, done) {
    (0, _uiAction_title2['default'])('deploying ' + environment);
    actions.buildServer(environment, function () {
      actions.uploadServer(environment, done);
    });
  }
};

exports['default'] = actions;
module.exports = exports['default'];
// merge with old config
//# sourceMappingURL=index.js.map