import { readConfig } from '../utils/config_utils';
import deployments from './';

export default (environment, command) => {
  const config = readConfig();
  const { deployment } = config.environments[environment];
  const { type = 'panter-meteor-classic' } = deployment || {};
  if (deployments[type]) {
    if (deployments[type][command]) {
      return deployments[type][command];
    }
    throw new Error(`Unkown deployment-command: ${command} in type ${type}`);
  } else {
    throw new Error(`Unkown deployment-type: ${type}`);
  }
};
