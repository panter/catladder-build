'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _buildAndroid_build = require('../build/android_build');

var _build_apps = require('./build_apps');

var _build_apps2 = _interopRequireDefault(_build_apps);

var _build_server = require('./build_server');

var _build_server2 = _interopRequireDefault(_build_server);

var _deploy = require('./deploy');

var _deploy2 = _interopRequireDefault(_deploy);

var _edit_env = require('./edit_env');

var _edit_env2 = _interopRequireDefault(_edit_env);

var _init = require('./init');

var _init2 = _interopRequireDefault(_init);

var _ios_reveal_project = require('./ios_reveal_project');

var _ios_reveal_project2 = _interopRequireDefault(_ios_reveal_project);

var _restart = require('./restart');

var _restart2 = _interopRequireDefault(_restart);

var _setup = require('./setup');

var _setup2 = _interopRequireDefault(_setup);

var _upload_server = require('./upload_server');

var _upload_server2 = _interopRequireDefault(_upload_server);

exports['default'] = {
  init: _init2['default'],
  setup: _setup2['default'],
  editEnv: _edit_env2['default'],
  restart: _restart2['default'],
  buildServer: _build_server2['default'],
  buildApps: _build_apps2['default'],
  iosRevealProject: _ios_reveal_project2['default'],
  androidPrepareForStore: _buildAndroid_build.androidPrepareForStore,
  androidInit: _buildAndroid_build.androidInit,
  uploadServer: _upload_server2['default'],
  deploy: _deploy2['default']
};
module.exports = exports['default'];
//# sourceMappingURL=index.js.map