import { getFullVersionString } from '../../../utils/git_utils';

export const getKubernetesImageName = (config, environment) => {
  const { dockerEndPoint = 'gcr.io/skynet-164509', appname = 'unknown app' } = config;

  const versionTag = getFullVersionString(environment);
  return `${dockerEndPoint}/${appname}:${versionTag}`;
};
