import { androidInit, androidPrepareForStore } from '../build/android_build';
import buildApps from './build_apps';
import buildServer from './build_server';
import deploy from './deploy';
import editEnv from './edit_env';
import init from './init';
import iosRevealProject from './ios_reveal_project';
import restart from './restart';
import setup from './setup';
import uploadServer from './upload_server';


export default {
  init,
  setup,
  editEnv,
  restart,
  buildServer,
  buildApps,
  iosRevealProject,
  androidPrepareForStore,
  androidInit,
  uploadServer,
  deploy,
};
