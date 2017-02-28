import fs from 'fs';
import yaml from 'js-yaml';

import _ from 'lodash';

export const writeConfig = (configFile, config) => {
  const theyaml = yaml.safeDump(config);
  fs.writeFileSync(configFile, theyaml);
};
export const readConfig = configFile => yaml.safeLoad(fs.readFileSync(configFile));


export const getSshConfig = (configFile, environment) => {
  const config = readConfig(configFile);
  return _.pick(
    config.environments[environment],
    ['host', 'user', 'password', 'key'],
  );
};


export const createEnvSh = ({ environment, version }, envVars) => {
  const getSanitziedValue = (value) => {
    if (_.isObject(value)) {
      return JSON.stringify(value);
    }
    return value;
  };
  const body = _.keys(envVars).map((key) => {
    const value = getSanitziedValue(envVars[key]);

    return `export ${key}='${value}'`;
  }).join('\n');
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
