import remoteExec from 'ssh-exec';
import { getSshConfig } from '../../utils/config_utils';

const CONFIGFILE = '.catladder.yaml';

export default (environment, done) => {
  remoteExec('./bin/nodejs.sh restart', getSshConfig(CONFIGFILE, environment), () => {
    done(null, 'server restarted');
  }).pipe(process.stdout);
};
