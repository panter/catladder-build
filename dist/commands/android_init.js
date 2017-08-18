'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _buildAndroid_build = require('../build/android_build');

var _utilsConfig_utils = require('../utils/config_utils');

var CONFIGFILE = '.catladder.yaml';

exports['default'] = function (environment, done) {
  var config = (0, _utilsConfig_utils.readConfig)(CONFIGFILE);
  (0, _buildAndroid_build.androidInit)({ config: config, environment: environment });
  done(null, 'android is init');
};

module.exports = exports['default'];
//# sourceMappingURL=android_init.js.map