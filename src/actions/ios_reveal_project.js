import { execSync } from 'child_process';
import fs from 'fs';

import { getIosBuildProjectFolder } from '../configs/directories';
import { readConfig } from '../utils/config_utils';

const CONFIGFILE = '.catladder.yaml';


export default (environment, done) => {
  const config = readConfig(CONFIGFILE);
  if (fs.existsSync(getIosBuildProjectFolder({ config, environment }))) {
    execSync(`open ${getIosBuildProjectFolder({ config, environment })}`);
  } else {
    done(null, `ios project does not exist under ${getIosBuildProjectFolder({ config, environment })}`);
  }
};
