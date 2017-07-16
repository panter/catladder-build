import actionTitle from '../ui/action_title';
import buildServer from './build_server';
import uploadServer from './upload_server';

export default (environment, done) => {
  actionTitle(`deploying ${environment}`);
  buildServer(environment, () => {
    uploadServer(environment, done);
  });
};
