import { set, get } from 'lodash';

import { getFullVersionString } from '../../../utils/git_utils';
import { writeConfig } from '../../../utils/config_utils';

const CONFIGFILE = '.catladder.yaml';

export const generateKubernetesImageName = (config, environment) => {
  const { dockerEndPoint = 'gcr.io/skynet-164509', appname = 'unknown app' } = config;

  const versionTag = getFullVersionString(environment);
  return `${dockerEndPoint}/${appname}:${versionTag}`;
};

export const getKubernetesImageNameFromConfig = (config, environment) =>
  get(config, ['environments', environment, 'deployment', 'image']);

export const writeImageNameToConfig = (config, environment, imageName) => {
  set(config, ['environments', environment, 'deployment', 'image'], imageName);
  writeConfig(CONFIGFILE, config);
};
