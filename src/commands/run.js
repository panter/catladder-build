import { merge } from 'lodash';
import prompt from 'prompt';
import uniqueFilename from 'unique-filename';
import fs from 'fs';
import os from 'os';

import { passEnvFile } from '../configs/directories';
import { readConfig, getEnvCommandString } from '../utils/config_utils';
import { readPassYaml } from '../utils/pass_utils';
import exec from '../utils/exec';

export default (environment = 'develop', done) => {
  const config = readConfig();
  prompt.start();

  if (!config.run) {
    throw new Error('please config `run`');
  }

  const { appDir } = config;

  const { command, env: runEnv } = config.run;

  const passPathForEnvVars = passEnvFile({ config, environment });
  const passEnv = readPassYaml(passPathForEnvVars);

  const { env: environmentEnv } = config.environments[environment] || {};

  const fullEnv = merge({}, environmentEnv, passEnv, runEnv);
  let commandArgs = '';
  // damn https://github.com/meteor/meteor/issues/9907
  const tempSettingsFile = uniqueFilename(os.tmpdir(), 'settings');

  if (command === 'meteor' && fullEnv.METEOR_SETTINGS) {
    fs.writeFileSync(tempSettingsFile, JSON.stringify(fullEnv.METEOR_SETTINGS));
    delete fullEnv.METEOR_SETTINGS;

    commandArgs = ` --settings ${tempSettingsFile}`;
  }
  const envString = getEnvCommandString(fullEnv);
  try {
    exec(`${appDir ? `cd ${appDir} && ` : ''}${envString} ${command} ${commandArgs}`);
  } catch (e) {
    // probably canceled
  } finally {
    if (fs.existsSync(tempSettingsFile)) fs.unlinkSync(tempSettingsFile);
  }
  done();
};
