
import { execSync } from 'child_process';
import fs from 'fs';
import moment from 'moment';
import path from 'path';
import _ from 'lodash';

import { readPass, generatePass, hasPass } from './pass_utils';

export const getAndroidBuildDir = (config, environment) => path.resolve(`${config.buildDir}/${environment}/android`);

const getKeystoreConfig = (config, environment) => {
  const envConfig = _.get(config, ['environments', environment]);
  const keyStore = path.resolve(envConfig.androidKeystore);
  const keystorePWPassPath = `${config.passPath}/${environment}/android_keystore_pw`;
  const keyname = `${config.appname}-${environment}`;
  const keyDName = envConfig.androidDName;
  return {
    keyStore, keyname, keystorePWPassPath, keyDName,
  };
};
const getKeystoreProps = (config, environment) => {
  const { keyStore, keyname, keystorePWPassPath } = getKeystoreConfig(config, environment);
  const keystorePW = readPass(keystorePWPassPath);
  return {
    keystorePW, keyStore, keyname, keystorePWPassPath,
  };
};


export const initAndroid = (config, environment) => {
  // create keystorePW if not existing
  const { keystorePWPassPath } = getKeystoreConfig(config, environment);
  if (!hasPass(keystorePWPassPath)) {
    generatePass(keystorePWPassPath);
  }

  // kudos to http://stackoverflow.com/questions/3997748/how-can-i-create-a-keystore
  const { keystorePW, keyStore, keyname, keyDName } = getKeystoreProps(config, environment);

  const createKeyCommand = `echo y | keytool -genkeypair -dname "${keyDName}" -alias ${keyname} --storepass ${keystorePW} --keystore ${keyStore} -validity 100`;
  execSync(createKeyCommand);
};

export const prepareAndroidForStore = (config, environment, done) => {
  const { keystorePW, keyStore, keyname } = getKeystoreProps(config, environment);
  const androidBuildDir = getAndroidBuildDir(config, environment);
  if (!fs.existsSync(androidBuildDir)) {
    throw new Error('android build dir does not exist');
  }
  if (!fs.existsSync(keyStore)) {
    throw new Error(`please call init-android ${environment} first`);
  }
  const now = moment.format('YYYYMMDD-HHmm');


  const inFile = `${androidBuildDir}/release-unsigned.apk`;
  const outfile = `${androidBuildDir}/${config.appname}-${environment}-${now}.apk`;
  const jarsignCommand = `jarsigner -sigalg SHA1withRSA -digestalg SHA1 ${inFile} ${keyname} --keystore ${keyStore} --storepass ${keystorePW}`;
  execSync(jarsignCommand, { stdio: [0, 1, 2] });
  if (fs.existsSync(outfile)) {
    fs.unlinkSync(outfile);
  }

  const zipAlignCommand = `"$ANDROID_HOME/build-tools/23.0.3/zipalign" 4 ${inFile} ${outfile}`;
  execSync(zipAlignCommand, { stdio: [0, 1, 2] });
  done(null, `your apk is ready: ${outfile}`);
};
