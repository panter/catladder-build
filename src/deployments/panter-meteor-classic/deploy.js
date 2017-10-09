import { buildServer } from '../../commands';
import actionTitle from '../ui/action_title';
import push from './push';
import restart from './restart';

export default (environment, done) => {
  actionTitle(`deploying ${environment}`);
  buildServer(environment, () => {
    push(environment, () => restart(environment, done));
  });
};
