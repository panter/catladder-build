'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _utilsGit_utils = require('../../utils/git_utils');

var _utilsConfig_utils = require('../../utils/config_utils');

exports['default'] = function (environment, done) {
  var _readConfig = (0, _utilsConfig_utils.readConfig)();

  var _readConfig$appname = _readConfig.appname;
  var appname = _readConfig$appname === undefined ? 'unknown app' : _readConfig$appname;

  console.log('would do the following if implemented: ');
  console.log('(but you can do it manually! 😽  )');
  console.log('  ');
  console.log('docker build -t ' + appname + ' .');
  var versionTag = (0, _utilsGit_utils.getFullVersionString)(environment);
  var fullImageName = 'gcr.io/skynet-164509/' + appname + ':' + versionTag;
  console.log('docker tag ' + appname + ' ' + fullImageName);
  console.log('docker push ' + fullImageName);
  console.log('generate or adjust: kube/' + environment + '/deployment.' + appname + '_worker.yml (add tag ' + versionTag + ')');
  console.log('generate or adjust: kube/' + environment + '/deployment.' + appname + '_web.yml (add tag ' + versionTag + ')');
  console.log('kubectl apply -f kube/' + environment + '/deployment.' + appname + '_worker.yml');
  console.log('kubectl apply -f kube/' + environment + '/deployment.' + appname + '_web.yml');
  done(null, 'done');
};

module.exports = exports['default'];
//# sourceMappingURL=deploy.js.map