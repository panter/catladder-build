import { buildServer } from '../../commands';
import actionTitle from '../ui/action_title';
import push from './push';

export default (environment, done) => {
  actionTitle(`deploying ${environment}`);
  buildServer(environment, () => {
    push(environment, done);
  });
};
