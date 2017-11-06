import getDeploymentCommand from '../deployments/get_deployment_command';

export default (environment, done) => {
  const command = getDeploymentCommand(environment, 'push');
  command(environment, done);
};
