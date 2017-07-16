import remoteExec from 'ssh-exec';

import { getSshConfig } from '../utils/config_utils';
import actionTitle from '../ui/action_title';

const CONFIGFILE = '.catladder.yaml';

export default (environment, done) => {
  actionTitle(`restarting ${environment}`);
  remoteExec('./bin/nodejs.sh restart', getSshConfig(CONFIGFILE, environment), () => {
    done(null, 'server restarted');
  }).pipe(process.stdout);
};
