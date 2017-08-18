import { androidPrepareForStore } from '../build/android_build';
import { readConfig } from '../utils/config_utils';

const CONFIGFILE = '.catladder.yaml';


export default (environment, done) => {
  const config = readConfig(CONFIGFILE);
  const outfile = androidPrepareForStore({ config, environment });
  done(null, `your apk is ready: ${outfile}`);
};
