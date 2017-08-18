import remoteExec from 'ssh-exec';

import { execSync } from 'child_process';

import { getBuildDir } from '../configs/directories';
import { getSshConfig, readConfig } from '../utils/config_utils';
import actionTitle from '../ui/action_title';
import restart from './restart';

const CONFIGFILE = '.catladder.yaml';


export default (environment, done) => {
  const next = () => restart(environment, done);
  const config = readConfig(CONFIGFILE);
  // const envConf = config.environments[environment];
  const sshConfig = getSshConfig(CONFIGFILE, environment);
  actionTitle(`uploading server bundle to ${environment}`);
  const buildDir = getBuildDir({ config, environment });
  execSync(`scp ${buildDir}/app.tar.gz ${sshConfig.user}@${sshConfig.host}:`, { stdio: 'inherit' });
  remoteExec(`
      rm -rf ~/app/last
      mv ~/app/bundle ~/app/last
      rm ~/app/current
      ln -s ~/app/bundle ~/app/current
      tar xfz app.tar.gz -C app
      pushd ~/app/bundle/programs/server
      npm install
      popd
    `, sshConfig, next).pipe(process.stdout);
};
