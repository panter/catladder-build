'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _commands = require('../../commands');

var _uiAction_title = require('../ui/action_title');

var _uiAction_title2 = _interopRequireDefault(_uiAction_title);

var _push = require('./push');

var _push2 = _interopRequireDefault(_push);

var _restart = require('./restart');

var _restart2 = _interopRequireDefault(_restart);

exports['default'] = function (environment, done) {
  (0, _uiAction_title2['default'])('deploying ' + environment);
  (0, _commands.buildServer)(environment, function () {
    (0, _push2['default'])(environment, function () {
      return (0, _restart2['default'])(environment, done);
    });
  });
};

module.exports = exports['default'];
//# sourceMappingURL=deploy.js.map