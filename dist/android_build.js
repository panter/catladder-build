'use strict';

var _extends = require('babel-runtime/helpers/extends')['default'];

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

var _shellEscape = require('shell-escape');

var _shellEscape2 = _interopRequireDefault(_shellEscape);

var _pass_utils = require('./pass_utils');

var getAndroidBuildDir = function getAndroidBuildDir(_ref) {
  var config = _ref.config;
  var environment = _ref.environment;
  return _path2['default'].resolve(config.buildDir + '/' + environment + '/android');
};
exports.getAndroidBuildDir = getAndroidBuildDir;
var getAndroidBuildProjectFolder = function getAndroidBuildProjectFolder(_ref2) {
  var config = _ref2.config;
  var environment = _ref2.environment;
  return getAndroidBuildDir({ config: config, environment: environment }) + '/project';
};
exports.getAndroidBuildProjectFolder = getAndroidBuildProjectFolder;
var getAndroidBuildTool = function getAndroidBuildTool(config, buildTool) {
  return _path2['default'].resolve(process.env.ANDROID_HOME + '/build-tools/' + config.androidBuildToolVersion + '/' + buildTool);
};

exports.getAndroidBuildTool = getAndroidBuildTool;
var getKeystoreConfig = function getKeystoreConfig(_ref3) {
  var config = _ref3.config;
  var environment = _ref3.environment;

  var envConfig = _lodash2['default'].get(config, ['environments', environment]);
  var keyStore = _path2['default'].resolve(envConfig.androidKeystore);
  var keystorePWPassPath = config.passPath + '/android_keystore_pw';
  var keyname = envConfig.androidKeyname;
  var keyDName = envConfig.androidDName;
  return {
    keyStore: keyStore, keyname: keyname, keystorePWPassPath: keystorePWPassPath, keyDName: keyDName
  };
};
var getKeystoreProps = function getKeystoreProps(_ref4) {
  var config = _ref4.config;
  var environment = _ref4.environment;

  var keyStoreConfig = getKeystoreConfig({ config: config, environment: environment });
  var keystorePWPassPath = keyStoreConfig.keystorePWPassPath;

  var keystorePW = _lodash2['default'].trim((0, _pass_utils.readPass)(keystorePWPassPath));
  return _extends({}, keyStoreConfig, { keystorePW: keystorePW
  });
};

var androidInit = function androidInit(_ref5) {
  var config = _ref5.config;
  var environment = _ref5.environment;

  // create keystorePW if not existing

  var _getKeystoreConfig = getKeystoreConfig({ config: config, environment: environment });

  var keystorePWPassPath = _getKeystoreConfig.keystorePWPassPath;

  if (!(0, _pass_utils.hasPass)(keystorePWPassPath)) {
    (0, _pass_utils.generatePass)(keystorePWPassPath);
  }

  // kudos to http://stackoverflow.com/questions/3997748/how-can-i-create-a-keystore

  var _getKeystoreProps = getKeystoreProps({ config: config, environment: environment });

  var keystorePW = _getKeystoreProps.keystorePW;
  var keyStore = _getKeystoreProps.keyStore;
  var keyname = _getKeystoreProps.keyname;
  var keyDName = _getKeystoreProps.keyDName;

  var createKeyCommand = (0, _shellEscape2['default'])(['keytool', '-genkeypair', '-dname', keyDName, '-alias', keyname, '--storepass', keystorePW, '--keypass', keystorePW, '--keystore', keyStore, '-keyalg', 'RSA', '-keysize', 2048, '-validity', 10000]);
  (0, _child_process.execSync)('echo y | ' + createKeyCommand, { stdio: 'inherit' });
};

exports.androidInit = androidInit;
var androidPrepareForStore = function androidPrepareForStore(_ref6) {
  var config = _ref6.config;
  var environment = _ref6.environment;

  var _getKeystoreProps2 = getKeystoreProps({ config: config, environment: environment });

  var keystorePW = _getKeystoreProps2.keystorePW;
  var keyStore = _getKeystoreProps2.keyStore;
  var keyname = _getKeystoreProps2.keyname;

  var androidBuildDir = getAndroidBuildDir({ config: config, environment: environment });
  if (!_fs2['default'].existsSync(androidBuildDir)) {
    throw new Error('android build dir does not exist');
  }
  if (!_fs2['default'].existsSync(keyStore)) {
    throw new Error('please call android-init ' + environment + ' first');
  }
  var now = (0, _moment2['default'])().format('YYYYMMDD-HHmm');

  var inFile = androidBuildDir + '/release-unsigned.apk';
  var alignFile = androidBuildDir + '/release-unsigned-aligned.apk';
  if (_fs2['default'].existsSync(alignFile)) {
    _fs2['default'].unlinkSync(alignFile);
  }
  var zipAlignCommand = (0, _shellEscape2['default'])([getAndroidBuildTool(config, 'zipalign'), 4, inFile, alignFile]);
  (0, _child_process.execSync)(zipAlignCommand, { stdio: 'inherit' });

  var outfile = androidBuildDir + '/' + config.appname + '-' + environment + '-' + now + '.apk';
  if (_fs2['default'].existsSync(outfile)) {
    _fs2['default'].unlinkSync(outfile);
  }
  var signCommand = (0, _shellEscape2['default'])([getAndroidBuildTool(config, 'apksigner'), 'sign', '--ks-key-alias', keyname, '--ks', keyStore, '--ks-pass', 'stdin', '--key-pass', 'stdin', '--out', outfile, alignFile]);
  (0, _child_process.execSync)(signCommand, { input: keystorePW + '\n' + keystorePW, stdio: ['pipe', 1, 2] });

  return outfile;
};
exports.androidPrepareForStore = androidPrepareForStore;
//# sourceMappingURL=android_build.js.map