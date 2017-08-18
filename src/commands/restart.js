import actionTitle from '../ui/action_title';
import getDeploymentCommand from '../deployments/get_deployment_command';


export default (environment, done) => {
  const deployCommand = getDeploymentCommand(environment, 'restart');
  actionTitle(`restarting ${environment}`);
  deployCommand(environment, done);
};
