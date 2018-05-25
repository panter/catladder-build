import fs from 'fs';
import yaml from 'js-yaml';

import _ from 'lodash';

const CONFIGFILE = '.catladder.yaml';

export const writeConfig = (configFile, config) => {
  const theyaml = yaml.safeDump(config);
  fs.writeFileSync(configFile, theyaml);
};
export const readConfig = () => yaml.safeLoad(fs.readFileSync(CONFIGFILE));

export const getSshConfig = (configFile, environment) => {
  const config = readConfig();
  return _.pick(config.environments[environment], ['host', 'user', 'password', 'key']);
};

const getSanitziedValue = (value) => {
  if (_.isObject(value)) {
    return JSON.stringify(value);
  }
  return value;
};

const getKeyValueArraySanitized = envVars =>
  _.keys(envVars).map(key => ({
    key,
    value: getSanitziedValue(envVars[key]),
  }));

export const getEnvCommandString = envVars =>
  getKeyValueArraySanitized(envVars)
    .map(({ key, value }) => `${key}='${value}'`)
    .join(' ');
export const createEnvSh = ({ environment, version }, envVars) => {
  // build is excluded, that is only used while building
  const body = getKeyValueArraySanitized(_.omit(envVars, ['build']))
    .map(({ key, value }) => `export ${key}='${value}'`)
    .join('\n');
  const envHeader = `
# autocreated with PANTER CATLADDER 🐱 🔧 v${version}
# environment: ${environment}
#
# DO NOT EDIT, use
# $ catladder setup ${environment}
# to edit
#
  `;
  return `${envHeader}\n${body}`;
};
