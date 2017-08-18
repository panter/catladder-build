import { androidInit } from '../build/android_build';
import { readConfig } from '../utils/config_utils';

const CONFIGFILE = '.catladder.yaml';

export default (environment, done) => {
  const config = readConfig(CONFIGFILE);
  androidInit({ config, environment });
  done(null, 'android is init');
};
