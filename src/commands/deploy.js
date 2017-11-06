import actionTitle from '../ui/action_title';
import getDeploymentCommand from '../deployments/get_deployment_command';

export default (environment, done) => {
  actionTitle(`deploying ${environment}`);
  const command = getDeploymentCommand(environment, 'deploy');
  command(environment, done);
};
