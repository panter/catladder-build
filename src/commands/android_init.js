import { androidInit } from '../build/android_build';
import { readConfig } from '../utils/config_utils';


export default (environment, done) => {
  const config = readConfig();
  androidInit({ config, environment });
  done(null, 'android is init');
};
