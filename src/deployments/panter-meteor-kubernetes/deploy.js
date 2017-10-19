import { buildServer } from '../../commands';
import push from './push';

export default (environment, done) => {
  buildServer(environment, () => {
    push(environment, done);
  });
};
