import rimraf from 'rimraf';

import fs from 'fs';

import {
  getAndroidBuildDir,
  getAndroidBuildProjectFolder,
} from '../build/android_build';
import { getBuildDir, getIosBuildProjectFolder } from '../configs/directories';
import { getFullVersionString } from '../utils/git_utils';
import { readConfig } from '../utils/config_utils';
import actionTitle from '../ui/action_title';
import androidPrepareForStore from './android_prepare_for_store';
import execMeteorBuild from '../build/exec_meteor_build';
import iosRevealProject from './ios_reveal_project';

const CONFIGFILE = '.catladder.yaml';


export default (environment, done) => {
  const config = readConfig(CONFIGFILE);
  const buildDir = getBuildDir({ config, environment });
  actionTitle(`building mobile apps ${getFullVersionString(environment)}`);
  console.log(`build dir: ${buildDir}`);

  // remove project folders if existing
  // otherwise apps might get bloated with old code
  if (fs.existsSync(getAndroidBuildProjectFolder({ config, environment }))) {
    rimraf.sync(getAndroidBuildProjectFolder({ config, environment }));
  }
  if (fs.existsSync(getIosBuildProjectFolder({ config, environment }))) {
    rimraf.sync(getIosBuildProjectFolder({ config, environment }));
  }

  execMeteorBuild({ config, environment });

  // open ios project if exists
  iosRevealProject(environment, config);

  // init android if it exists
  if (fs.existsSync(getAndroidBuildDir({ config, environment }))) {
    androidPrepareForStore(environment, done);
  } else {
    done(null, `apps created in ${buildDir}`);
  }
};
