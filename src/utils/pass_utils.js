import { spawnSync } from 'child_process';

import _ from 'lodash';
import yaml from 'js-yaml';

import exec from './exec';

export const pullPass = () => exec('pass git pull', { stdio: ['pipe', 1, 2] });
export const pushPass = () => {
  pullPass();
  exec('pass git push', { stdio: ['pipe', 1, 2] });
};

export const readPass = (passPath) => {
  try {
    pullPass();
    return exec(`pass show ${passPath}`, { stdio: [0], encoding: 'utf-8' });
  } catch (error) {
    if (error.message.indexOf('is not in the password store') !== -1) {
      return null;
    }
    throw error;
  }
};

export const hasPass = passPath => !_.isEmpty(readPass(passPath));

export const generatePass = (passPath, length = 32) => {
  // generate without symbols
  exec(`pass generate -n ${passPath} ${length}`);
  pushPass();
  return readPass(passPath);
};
export const readPassYaml = passPath => yaml.safeLoad(readPass(passPath));

export const writePass = (passPath, input) => {
  console.log('writing to pass', passPath);
  exec(`pass insert ${passPath} -m`, { input, stdio: ['pipe', 1, 2] });
  pushPass();
};

export const editPass = (passPath) => {
  pullPass();
  spawnSync('pass', ['edit', passPath], {
    stdio: 'inherit',
  });
  pushPass();
};
