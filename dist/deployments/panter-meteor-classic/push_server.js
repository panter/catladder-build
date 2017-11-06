'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _child_process = require('child_process');

var _sshExec = require('ssh-exec');

var _sshExec2 = _interopRequireDefault(_sshExec);

var _configsDirectories = require('../../configs/directories');

var _utilsConfig_utils = require('../../utils/config_utils');

var _uiAction_title = require('../../ui/action_title');

var _uiAction_title2 = _interopRequireDefault(_uiAction_title);

var CONFIGFILE = '.catladder.yaml';

exports['default'] = function (environment, done) {
    var config = (0, _utilsConfig_utils.readConfig)();

    // const envConf = config.environments[environment];
    var sshConfig = (0, _utilsConfig_utils.getSshConfig)(CONFIGFILE, environment);
    (0, _uiAction_title2['default'])('uploading server bundle to ' + environment);
    var buildDir = (0, _configsDirectories.getBuildDir)({ config: config, environment: environment });
    (0, _child_process.execSync)('scp ' + buildDir + '/app.tar.gz ' + sshConfig.user + '@' + sshConfig.host + ':', { stdio: 'inherit' });
    (0, _sshExec2['default'])('\n      rm -rf ~/app/last\n      mv ~/app/bundle ~/app/last\n      rm ~/app/current\n      ln -s ~/app/bundle ~/app/current\n      tar xfz app.tar.gz -C app\n      pushd ~/app/bundle/programs/server\n      npm install\n      popd\n    ', sshConfig, done).pipe(process.stdout);
};

module.exports = exports['default'];
//# sourceMappingURL=push_server.js.map