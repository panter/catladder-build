import remoteExec from 'ssh-exec';

import { getBuildDir } from '../../configs/directories';
import { getSshConfig, readConfig } from '../../utils/config_utils';
import actionTitle from '../../ui/action_title';
import exec from '../../utils/exec';

const CONFIGFILE = '.catladder.yaml';

export default (environment, done) => {
  const config = readConfig();

  // const envConf = config.environments[environment];
  const sshConfig = getSshConfig(CONFIGFILE, environment);
  actionTitle(`uploading server bundle to ${environment}`);
  const buildDir = getBuildDir({ config, environment });
  exec(`scp ${buildDir}/app.tar.gz ${sshConfig.user}@${sshConfig.host}:`, { stdio: 'inherit' });
  remoteExec(
    `
      rm -rf ~/app/last
      mv ~/app/bundle ~/app/last
      rm ~/app/current
      ln -s ~/app/bundle ~/app/current
      tar xfz app.tar.gz -C app
      pushd ~/app/bundle/programs/server
      npm install
      popd
    `,
    sshConfig,
    done,
  ).pipe(process.stdout);
};
