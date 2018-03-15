import { readEnvFileFromPass } from '../utils/pass_utils';
import actionTitle from '../ui/action_title';
import getDeploymentCommand from '../deployments/get_deployment_command';

export default (environment, done) => {
  actionTitle(`deploying ${environment}`);
  // read it so that it asks for password
  // otherwise it asks in the middle of the build, which can take some minutes
  readEnvFileFromPass(environment);
  const command = getDeploymentCommand(environment, 'deploy');
  command(environment, done);
};
