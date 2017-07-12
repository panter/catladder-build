'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

exports['default'] = function (_ref) {
  var config = _ref.config;
  return {
    PORT: 8080,
    MONGO_URL: 'mongodb://localhost/' + config.appname,
    MONGO_OPLOG_URL: 'mongodb://localhost/local',
    MAIL_URL: 'smtp://localhost:25',
    METEOR_SETTINGS: {}
  };
};

module.exports = exports['default'];
//# sourceMappingURL=default_env.js.map