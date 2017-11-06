
import { readConfig } from '../utils/config_utils';
import actionTitle from '../ui/action_title';
import execMeteorBuild from '../build/exec_meteor_build';
import { getFullVersionString } from '../utils/git_utils';


export default (environment, done) => {
  const config = readConfig();
  // read build params
  actionTitle(`building server ${getFullVersionString(environment)}`);
  execMeteorBuild({ config, environment }, ['--server-only']);
  done(null, 'server built');
};
