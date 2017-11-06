import { androidPrepareForStore } from '../build/android_build';
import { readConfig } from '../utils/config_utils';


export default (environment, done) => {
  const config = readConfig();
  const outfile = androidPrepareForStore({ config, environment });
  done(null, `your apk is ready: ${outfile}`);
};
