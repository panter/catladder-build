'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _buildAndroid_build = require('../build/android_build');

var _utilsConfig_utils = require('../utils/config_utils');

var CONFIGFILE = '.catladder.yaml';

exports['default'] = function (environment, done) {
  var config = (0, _utilsConfig_utils.readConfig)(CONFIGFILE);
  var outfile = (0, _buildAndroid_build.androidPrepareForStore)({ config: config, environment: environment });
  done(null, 'your apk is ready: ' + outfile);
};

module.exports = exports['default'];
//# sourceMappingURL=android_prepare_for_store.js.map