import fs from 'fs';

import { getIosBuildProjectFolder } from '../configs/directories';
import { readConfig } from '../utils/config_utils';
import exec from '../utils/exec';

export default (environment, done) => {
  const config = readConfig();
  if (fs.existsSync(getIosBuildProjectFolder({ config, environment }))) {
    exec(`open ${getIosBuildProjectFolder({ config, environment })}`);
  } else {
    done(
      null,
      `ios project does not exist under ${getIosBuildProjectFolder({ config, environment })}`,
    );
  }
};
