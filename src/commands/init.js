import prompt from 'prompt';

import fs from 'fs';
import path from 'path';

import { initSchema } from '../configs/prompt_schemas';
import { readConfig, writeConfig } from '../utils/config_utils';

const CONFIGFILE = '.catladder.yaml';
export default (__, done) => {
  const configOld = (fs.existsSync(CONFIGFILE) && readConfig(CONFIGFILE)) || {};
  prompt.start();
  prompt.get(initSchema(configOld), (error,
      configNew,
    ) => {
    const config = {
      ...configOld,
      ...configNew,
    };
    writeConfig(CONFIGFILE, config);
    const buildDir = path.resolve(config.buildDir);
    if (!fs.existsSync(buildDir)) {
      fs.mkdirSync(buildDir);
    }
    done(null, `created ${CONFIGFILE}`);
  });
};
