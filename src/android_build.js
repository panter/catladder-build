
import { execSync } from 'child_process';
import fs from 'fs';
import moment from 'moment';
import path from 'path';
import _ from 'lodash';
import shellescape from 'shell-escape';

import { readPass, generatePass, hasPass } from './pass_utils';

export const getAndroidBuildDir = (config, environment) => path.resolve(`${config.buildDir}/${environment}/android`);
export const getAndroidBuildProjectFolder = (config, environment) => `${getAndroidBuildDir(config, environment)}/project`;
export const getAndroidBuildTool = (config, buildTool) => path.resolve(`${process.env.ANDROID_HOME}/build-tools/${config.androidBuildToolVersion}/${buildTool}`);

const getKeystoreConfig = (config, environment) => {
  const envConfig = _.get(config, ['environments', environment]);
  const keyStore = path.resolve(envConfig.androidKeystore);
  const keystorePWPassPath = `${config.passPath}/android_keystore_pw`;
  const keyname = envConfig.androidKeyname;
  const keyDName = envConfig.androidDName;
  return {
    keyStore, keyname, keystorePWPassPath, keyDName,
  };
};
const getKeystoreProps = (config, environment) => {
  const keyStoreConfig = getKeystoreConfig(config, environment);
  const { keystorePWPassPath } = keyStoreConfig;
  const keystorePW = _.trim(readPass(keystorePWPassPath));
  return {
    ...keyStoreConfig, keystorePW,
  };
};


export const androidInit = (config, environment) => {
  // create keystorePW if not existing
  const { keystorePWPassPath } = getKeystoreConfig(config, environment);
  if (!hasPass(keystorePWPassPath)) {
    generatePass(keystorePWPassPath);
  }

  // kudos to http://stackoverflow.com/questions/3997748/how-can-i-create-a-keystore
  const { keystorePW, keyStore, keyname, keyDName } = getKeystoreProps(config, environment);
  const createKeyCommand = shellescape(['keytool', '-genkeypair', '-dname', keyDName, '-alias', keyname, '--storepass', keystorePW, '--keypass', keystorePW, '--keystore', keyStore, '-keyalg', 'RSA', '-keysize', 2048, '-validity', 10000]);
  execSync(`echo y | ${createKeyCommand}`, { stdio: 'inherit' });
};

export const androidPrepareForStore = (config, environment) => {
  const { keystorePW, keyStore, keyname } = getKeystoreProps(config, environment);
  const androidBuildDir = getAndroidBuildDir(config, environment);
  if (!fs.existsSync(androidBuildDir)) {
    throw new Error('android build dir does not exist');
  }
  if (!fs.existsSync(keyStore)) {
    throw new Error(`please call android-init ${environment} first`);
  }
  const now = moment().format('YYYYMMDD-HHmm');


  const inFile = `${androidBuildDir}/release-unsigned.apk`;
  const alignFile = `${androidBuildDir}/release-unsigned-aligned.apk`;
  if (fs.existsSync(alignFile)) {
    fs.unlinkSync(alignFile);
  }
  const zipAlignCommand = shellescape([getAndroidBuildTool(config, 'zipalign'), 4, inFile, alignFile]);
  execSync(zipAlignCommand, { stdio: 'inherit' });

  const outfile = `${androidBuildDir}/${config.appname}-${environment}-${now}.apk`;
  if (fs.existsSync(outfile)) {
    fs.unlinkSync(outfile);
  }
  const signCommand = shellescape([getAndroidBuildTool(config, 'apksigner'), 'sign', '--ks-key-alias', keyname, '--ks', keyStore, '--ks-pass', 'stdin', '--key-pass', 'stdin', '--out', outfile, alignFile]);
  execSync(signCommand, { input: `${keystorePW}\n${keystorePW}`, stdio: ['pipe', 1, 2] });


  return outfile;
};
