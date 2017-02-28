'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _child_process = require('child_process');

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _pass_utils = require('./pass_utils');

var getAndroidBuildDir = function getAndroidBuildDir(config, environment) {
  return _path2['default'].resolve(config.buildDir + '/' + environment + '/android');
};

exports.getAndroidBuildDir = getAndroidBuildDir;
var getKeystoreConfig = function getKeystoreConfig(config, environment) {
  var envConfig = _lodash2['default'].get(config, ['environments', environment]);
  var keyStore = _path2['default'].resolve(envConfig.androidKeystore);
  var keystorePWPassPath = config.passPath + '/' + environment + '/android_keystore_pw';
  var keyname = config.appname + '-' + environment;
  var keyDName = envConfig.androidDName;
  return {
    keyStore: keyStore, keyname: keyname, keystorePWPassPath: keystorePWPassPath, keyDName: keyDName
  };
};
var getKeystoreProps = function getKeystoreProps(config, environment) {
  var _getKeystoreConfig = getKeystoreConfig(config, environment);

  var keyStore = _getKeystoreConfig.keyStore;
  var keyname = _getKeystoreConfig.keyname;
  var keystorePWPassPath = _getKeystoreConfig.keystorePWPassPath;

  var keystorePW = (0, _pass_utils.readPass)(keystorePWPassPath);
  return {
    keystorePW: keystorePW, keyStore: keyStore, keyname: keyname, keystorePWPassPath: keystorePWPassPath
  };
};

var initAndroid = function initAndroid(config, environment) {
  // create keystorePW if not existing

  var _getKeystoreConfig2 = getKeystoreConfig(config, environment);

  var keystorePWPassPath = _getKeystoreConfig2.keystorePWPassPath;

  if (!(0, _pass_utils.hasPass)(keystorePWPassPath)) {
    (0, _pass_utils.generatePass)(keystorePWPassPath);
  }

  // kudos to http://stackoverflow.com/questions/3997748/how-can-i-create-a-keystore

  var _getKeystoreProps = getKeystoreProps(config, environment);

  var keystorePW = _getKeystoreProps.keystorePW;
  var keyStore = _getKeystoreProps.keyStore;
  var keyname = _getKeystoreProps.keyname;
  var keyDName = _getKeystoreProps.keyDName;

  var createKeyCommand = 'echo y | keytool -genkeypair -dname "' + keyDName + '" -alias ' + keyname + ' --storepass ' + keystorePW + ' --keystore ' + keyStore + ' -validity 100';
  (0, _child_process.execSync)(createKeyCommand);
};

exports.initAndroid = initAndroid;
var prepareAndroidForStore = function prepareAndroidForStore(config, environment, done) {
  var _getKeystoreProps2 = getKeystoreProps(config, environment);

  var keystorePW = _getKeystoreProps2.keystorePW;
  var keyStore = _getKeystoreProps2.keyStore;
  var keyname = _getKeystoreProps2.keyname;

  var androidBuildDir = getAndroidBuildDir(config, environment);
  if (!_fs2['default'].existsSync(androidBuildDir)) {
    throw new Error('android build dir does not exist');
  }
  if (!_fs2['default'].existsSync(keyStore)) {
    throw new Error('please call init-android ' + environment + ' first');
  }
  var now = _moment2['default'].format('YYYYMMDD-HHmm');

  var inFile = androidBuildDir + '/release-unsigned.apk';
  var outfile = androidBuildDir + '/' + config.appname + '-' + environment + '-' + now + '.apk';
  var jarsignCommand = 'jarsigner -sigalg SHA1withRSA -digestalg SHA1 ' + inFile + ' ' + keyname + ' --keystore ' + keyStore + ' --storepass ' + keystorePW;
  (0, _child_process.execSync)(jarsignCommand, { stdio: [0, 1, 2] });
  if (_fs2['default'].existsSync(outfile)) {
    _fs2['default'].unlinkSync(outfile);
  }

  var zipAlignCommand = '"$ANDROID_HOME/build-tools/23.0.3/zipalign" 4 ' + inFile + ' ' + outfile;
  (0, _child_process.execSync)(zipAlignCommand, { stdio: [0, 1, 2] });
  done(null, 'your apk is ready: ' + outfile);
};
exports.prepareAndroidForStore = prepareAndroidForStore;
//# sourceMappingURL=android_build.js.map