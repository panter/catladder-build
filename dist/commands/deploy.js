'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _uiAction_title = require('../ui/action_title');

var _uiAction_title2 = _interopRequireDefault(_uiAction_title);

var _build_server = require('./build_server');

var _build_server2 = _interopRequireDefault(_build_server);

var _upload_server = require('./upload_server');

var _upload_server2 = _interopRequireDefault(_upload_server);

exports['default'] = function (environment, done) {
  (0, _uiAction_title2['default'])('deploying ' + environment);
  (0, _build_server2['default'])(environment, function () {
    (0, _upload_server2['default'])(environment, done);
  });
};

module.exports = exports['default'];
//# sourceMappingURL=deploy.js.map