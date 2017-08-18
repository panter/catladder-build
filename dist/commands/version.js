'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _packageJson = require('../../package.json');

var _utilsGit_utils = require('../utils/git_utils');

var _utilsConfig_utils = require('../utils/config_utils');

var CONFIGFILE = '.catladder.yaml';

exports['default'] = function (__, done) {
  var projectConfig = 'no catladder project';
  try {
    var config = (0, _utilsConfig_utils.readConfig)(CONFIGFILE);
    projectConfig = JSON.stringify(config, null, 2);
  } catch (e) {
    // empty
  }

  console.log('\n  catladder version: ' + _packageJson.version + '\n\n  project version: ' + (0, _utilsGit_utils.getFullGitVersion)() + '\n\n  project config:\n\n  ' + projectConfig + '\n  ');
  done(null);
};

module.exports = exports['default'];
//# sourceMappingURL=version.js.map