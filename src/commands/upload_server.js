import getDeploymentCommand from '../deployments/get_deployment_command';
import restart from './restart';

export default (environment, done) => {
  const deployCommand = getDeploymentCommand(environment, 'deploy');
  const next = () => restart(environment, done);
  deployCommand(environment, next);
};
