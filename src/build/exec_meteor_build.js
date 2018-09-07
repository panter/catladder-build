import _ from 'lodash';

import { getBuildDir } from '../configs/directories';
import exec from '../utils/exec';

const execInstallNpmModules = ({ config }) => {
  if (config.useYarn) {
    // install yarn if not available on meteor
    exec('meteor npm install -g yarn', {
      cwd: config.appDir,
      stdio: 'inherit',
    });
  }
  exec(`meteor ${config.useYarn ? 'yarn' : 'npm'} install`, {
    cwd: config.appDir,
    stdio: 'inherit',
  });
};

export default ({ config, environment, additionalBuildEnv = {} }, args = []) => {
  const buildDir = getBuildDir({ config, environment });
  const envConf = config.environments[environment];
  // read build params
  const { buildEnv = {} } = envConf;
  const buildEnvWithAppVersions = {
    ...additionalBuildEnv,
    ...buildEnv,
  };
  const buildEnvString = _.map(buildEnvWithAppVersions, (value, key) => `${key}='${value}'`).join(
    ' ',
  );
  execInstallNpmModules({ config });
  exec(
    `${buildEnvString} meteor build ${args.join(' ')} --architecture os.linux.x86_64 --server ${
      envConf.url
    } --directory ${buildDir}`,
    {
      cwd: config.appDir,
      stdio: 'inherit',
    },
  );
};
