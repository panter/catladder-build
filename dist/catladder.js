'use strict';

var _slicedToArray = require('babel-runtime/helpers/sliced-to-array')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

var _interopRequireWildcard = require('babel-runtime/helpers/interop-require-wildcard')['default'];

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _camelcase = require('camelcase');

var _camelcase2 = _interopRequireDefault(_camelcase);

var _minimist = require('minimist');

var _minimist2 = _interopRequireDefault(_minimist);

var _commands = require('./commands');

var commands = _interopRequireWildcard(_commands);

var _uiDone_error = require('./ui/done_error');

var _uiDone_error2 = _interopRequireDefault(_uiDone_error);

var _uiDone_success = require('./ui/done_success');

var _uiDone_success2 = _interopRequireDefault(_uiDone_success);

var _uiIntro = require('./ui/intro');

var _uiIntro2 = _interopRequireDefault(_uiIntro);

// parse options
var options = (0, _minimist2['default'])(process.argv.slice(2));

var _options$_ = _slicedToArray(options._, 2);

var commandRaw = _options$_[0];
var environment = _options$_[1];

var command = commandRaw && (0, _camelcase2['default'])(commandRaw);

// show intro
(0, _uiIntro2['default'])();

var done = function done(error, message) {
  if (!error) {
    (0, _uiDone_success2['default'])(message);
  } else {
    (0, _uiDone_error2['default'])(error, message);
  }
};

if (commands[command]) {
  if (command !== 'init' && !environment) {
    (0, _uiDone_error2['default'])(null, 'please specify an environment');
  } else {
    try {
      commands[command](environment, done);
    } catch (e) {
      done(e, 'command failed');
    }
  }
} else {
  console.log('available commands: ');
  console.log('');
  console.log(_lodash2['default'].keys(commands).join('\n'));
  done();
}
//# sourceMappingURL=catladder.js.map