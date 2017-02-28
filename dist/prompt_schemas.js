'use strict';

var _extends = require('babel-runtime/helpers/extends')['default'];

var _objectWithoutProperties = require('babel-runtime/helpers/object-without-properties')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _prompt = require('prompt');

var _prompt2 = _interopRequireDefault(_prompt);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var withDefaults = function withDefaults(schema) {
  var defaults = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
  return _extends({}, schema, {
    properties: _lodash2['default'].mapValues(schema.properties, function (value, key) {
      return _extends({}, value, {
        'default': function _default() {
          return defaults[key] || _lodash2['default'].result(value, 'default');
        }
      });
    })
  });
};

var initSchema = function initSchema(config) {
  return withDefaults({
    properties: {
      customer: {
        description: 'Customer kürzel',
        required: true,
        'default': 'pan'
      },
      appname: {
        description: 'App name (for dbs, filenames, etc.)',
        type: 'string',
        required: true,
        pattern: /^[a-zA-Z]+$/
      },
      passPath: {
        description: 'Path in pass',
        required: true,
        'default': function _default() {
          return _prompt2['default'].history('customer').value + '/' + _prompt2['default'].history('appname').value;
        }
      },
      appDir: {
        description: 'app directory',
        type: 'string',
        'default': './app'
      },
      buildDir: {
        description: 'build directory',
        type: 'string',
        'default': './build'
      },
      androidBuildToolVersion: {
        description: 'android build tool version',
        type: 'string',
        'default': '25.0.2'
      }
    }
  }, config);
};

exports.initSchema = initSchema;
var environmentSchema = function environmentSchema(_ref) {
  var environment = _ref.environment;
  var appname = _ref.appname;

  var config = _objectWithoutProperties(_ref, ['environment', 'appname']);

  return withDefaults({
    properties: {
      host: {
        description: 'ssh host',
        type: 'string',
        required: true,
        'default': appname + '-' + environment + '.panter.biz'
      },
      user: {
        description: 'ssh user',
        'default': 'app'
      },
      url: {
        description: 'full url',
        'default': function _default() {
          return 'https://' + _prompt2['default'].history('host').value;
        }
      },
      androidKeystore: {
        description: 'android keystore file',
        type: 'string',
        'default': './android.keystore'
      },
      androidKeyname: {
        description: 'Android keystore name / alias',
        'default': appname + '-' + environment
      },
      androidDName: {
        description: 'android dname for key',
        type: 'string',
        'default': function _default() {
          return 'cn=Panter, ou=Panter, o=Panter, c=CH';
        }
      }
    }
  }, _lodash2['default'].get(config, ['environments', environment]));
};
exports.environmentSchema = environmentSchema;
//# sourceMappingURL=prompt_schemas.js.map