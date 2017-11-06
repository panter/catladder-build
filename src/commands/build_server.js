import { getBuildNumberFromGit, getFullVersionString, getVersionFromTag } from '../utils/git_utils';
import { readConfig } from '../utils/config_utils';
import actionTitle from '../ui/action_title';
import execMeteorBuild from '../build/exec_meteor_build';

export default (environment, done) => {
  const config = readConfig();
  // read build params
  actionTitle(`building server ${getFullVersionString(environment)}`);
  const additionalBuildEnv = {
    SERVER_APP_BUILD_NUMBER: getBuildNumberFromGit(),
    SERVER_APP_VERSION: getVersionFromTag(),
  };
  execMeteorBuild({ config, environment, additionalBuildEnv }, ['--server-only']);
  done(null, 'server built');
};
