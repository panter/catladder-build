import _ from 'lodash';
import { execSync } from 'child_process';
import { getBuildDir } from '../configs/directories';
import { getBuildNumberFromGit, getTagFromGit, getFullVersionString } from '../utils/git_utils';

const execInstallNpmModules = ({ config }) => {
  execSync(`meteor ${config.useYarn ? 'yarn' : 'npm'} install`, { cwd: config.appDir, stdio: 'inherit' });
};


export default ({ config, environment, additionalBuildEnv = {} }, args = []) => {
  const buildDir = getBuildDir({ config, environment });
  const envConf = config.environments[environment];
  // read build params
  const { buildEnv = {} } = envConf;
  const buildEnvWithAppVersions = {
    ...additionalBuildEnv,
    VERSION_BUILD_NUMBER: getBuildNumberFromGit(),
    VERSION_TAG: getTagFromGit(),
    VERSION_FULL_STRING: getFullVersionString(environment),
    ...buildEnv,
  };
  const buildEnvString = _.map(buildEnvWithAppVersions, (value, key) => `${key}='${value}'`).join(' ');
  execInstallNpmModules({ config });
  execSync(
    `${buildEnvString} meteor build ${args.join(' ')} --server ${envConf.url} ${buildDir}`,
    { cwd: config.appDir, stdio: 'inherit' },
  );
};
