import yaml from 'js-yaml';

import _ from 'lodash';
import { execSync, spawnSync } from 'child_process';

export const readPass = (passPath) => {
  try {
    return execSync(`pass show ${passPath}`, { stdio: [0], encoding: 'utf-8' });
  } catch (error) {
    if (error.message.indexOf('is not in the password store') !== -1) {
      return null;
    }
    throw error;
  }
};

export const hasPass = passPath => (
  !_.isEmpty(readPass(passPath))
);

export const generatePass = (passPath, length = 32) => {
  execSync(`pass generate ${passPath} ${length}`);
  return readPass(passPath);
};
export const readPassYaml = passPath => yaml.safeLoad(readPass(passPath));

export const writePass = (passPath, input) => {
  console.log('writing to pass', passPath);
  execSync(`pass insert ${passPath} -m`, { input });
};

export const editPass = (passPath) => {
  spawnSync('pass', ['edit', passPath], {
    stdio: 'inherit',
  });
};
