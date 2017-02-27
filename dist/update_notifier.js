'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

var _updateNotifier = require('update-notifier');

var _updateNotifier2 = _interopRequireDefault(_updateNotifier);

var _packageJson = require('../package.json');

var _packageJson2 = _interopRequireDefault(_packageJson);

(0, _updateNotifier2['default'])({ pkg: _packageJson2['default'] }).notify();
//# sourceMappingURL=update_notifier.js.map