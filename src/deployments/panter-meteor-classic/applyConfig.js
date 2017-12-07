import remoteExec from 'ssh-exec';

import { createEnvSh, getSshConfig, readConfig } from '../../utils/config_utils';
import { passEnvFile } from '../../configs/directories';
import { readPassYaml } from '../../utils/pass_utils';
import { version } from '../../../package.json';
import actionTitle from '../../ui/action_title';

const CONFIGFILE = '.catladder.yaml';
export default (environment, done) => {
  actionTitle(`apply config ${environment}`);
  const config = readConfig();
  const passPathForEnvVars = passEnvFile({ config, environment });
  // load changed envVars and create env.sh on server
  // we create ROOT_URL always from the config
  const envConfig = config[environment];
  const envSh = createEnvSh(
    { version, environment },
    {
      ...readPassYaml(passPathForEnvVars),
      ROOT_URL: envConfig.url,
    },
  );
  // create env.sh on server
  remoteExec(
    `echo "${envSh.replace(/"/g, '\\"')}" > ~/app/env.sh`,
    getSshConfig(CONFIGFILE, environment),
    (err) => {
      if (err) {
        throw err;
      }
      console.log('');
      console.log('~/app/env.sh has ben written on ', envConfig.host);
      done(null, `${environment} is set up, please restart server`);
    },
  ).pipe(process.stdout);
};
