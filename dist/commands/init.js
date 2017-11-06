'use strict';

var _extends = require('babel-runtime/helpers/extends')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _prompt = require('prompt');

var _prompt2 = _interopRequireDefault(_prompt);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _configsPrompt_schemas = require('../configs/prompt_schemas');

var _utilsConfig_utils = require('../utils/config_utils');

var CONFIGFILE = '.catladder.yaml';

exports['default'] = function (__, done) {
  var configOld = _fs2['default'].existsSync(CONFIGFILE) && (0, _utilsConfig_utils.readConfig)() || {};
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
};

module.exports = exports['default'];
//# sourceMappingURL=init.js.map