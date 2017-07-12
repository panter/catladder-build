import prompt from 'prompt';
import remoteExec from 'ssh-exec';
import rimraf from 'rimraf';
import yaml from 'js-yaml';
import _ from 'lodash';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

import { androidInit, androidPrepareForStore, getAndroidBuildDir, getAndroidBuildProjectFolder } from '../build/android_build';
import {
  getBuildNumberFromGit,
  getTagFromGit,
} from '../utils/git_utils';
import { getSshConfig, readConfig, writeConfig, createEnvSh } from '../utils/config_utils';
import { initSchema, environmentSchema } from '../configs/prompt_schemas';
import { passEnvFile, getBuildDir, getIosBuildProjectFolder } from '../configs/directories';
import { version } from '../../package.json';
import { writePass, editPass, readPassYaml } from '../utils/pass_utils';
import actionTitle from '../ui/action_title';
import defaultEnv from '../configs/default_env';
import execMeteorBuild from '../build/exec_meteor_build';

const CONFIGFILE = '.catladder.yaml';

const getFullVersionString = env => `${env}-${getTagFromGit()}@${getBuildNumberFromGit()}`;

const actions = {
  init(__, done) {
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
  },
  setup(environment, done) {
    const config = readConfig(CONFIGFILE);
    prompt.start();

    actionTitle(`setting up ${environment}`);
    const passPathForEnvVars = passEnvFile({ config, environment });
    // console.log(passPathForEnvVars);
    const oldEnvConfig = _.get(config, ['environments', environment], {});
    prompt.get(environmentSchema({ ...config, environment }), (error, envConfig) => {
      // write new envConfig
      config.environments = {
        ...config.environments,
        [environment]: {
          ...oldEnvConfig, // merge with old config
          ...envConfig,
        },
      };
      writeConfig(CONFIGFILE, config);
      // update env-vars in path
      // first get current vars in path
      let envVars = readPassYaml(passPathForEnvVars);
      // if envVars do not exist yet, create new one and write to pass
      if (_.isEmpty(envVars)) {
        envVars = defaultEnv({ config, envConfig });
        writePass(passPathForEnvVars, yaml.safeDump(envVars));
      }
      // open editor to edit the en vars
      editPass(passPathForEnvVars);
      // load changed envVars and create env.sh on server
      // we create ROOT_URL always from the config
      const envSh = createEnvSh(
        { version, environment },
        {
          ...readPassYaml(passPathForEnvVars),
          ROOT_URL: envConfig.url,
        },
      );
      // create env.sh on server
      remoteExec(`echo "${envSh.replace(/"/g, '\\"')}" > ~/app/env.sh`, getSshConfig(CONFIGFILE, environment), (err) => {
        if (err) {
          throw err;
        }
        console.log('');
        console.log('~/app/env.sh has ben written on ', envConfig.host);
        done(null, `${environment} is set up, please restart server`);
      }).pipe(process.stdout);
    });
  },
  editEnv(environment, done) {
    const config = readConfig(CONFIGFILE);
    const passPathForEnvVars = passEnvFile({ config, environment });
    editPass(passPathForEnvVars);
    done(null, 'env in pass edited. Remember that this not updates the server. Use catladder setup <env> to do so');
  },
  restart(environment, done) {
    actionTitle(`restarting ${environment}`);
    remoteExec('./bin/nodejs.sh restart', getSshConfig(CONFIGFILE, environment), () => {
      done(null, 'server restarted');
    }).pipe(process.stdout);
  },
  buildServer(environment, done) {
    const config = readConfig(CONFIGFILE);
    // read build params
    actionTitle(`building server ${getFullVersionString(environment)}`);

    execMeteorBuild({ config, environment }, ['--server-only']);
    done(null, 'server built');
  },
  buildApps(environment, done) {
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
    actions.iosRevealProject(environment, config);

    // init android if it exists
    if (fs.existsSync(getAndroidBuildDir({ config, environment }))) {
      actions.androidPrepareForStore(environment, done);
    } else {
      done(null, `apps created in ${buildDir}`);
    }
  },
  iosRevealProject(environment, done) {
    const config = readConfig(CONFIGFILE);
    if (fs.existsSync(getIosBuildProjectFolder({ config, environment }))) {
      execSync(`open ${getIosBuildProjectFolder({ config, environment })}`);
    } else {
      done(null, `ios project does not exist under ${getIosBuildProjectFolder({ config, environment })}`);
    }
  },
  androidPrepareForStore(environment, done) {
    const config = readConfig(CONFIGFILE);
    const outfile = androidPrepareForStore({ config, environment });
    done(null, `your apk is ready: ${outfile}`);
  },
  androidInit(environment, done) {
    const config = readConfig(CONFIGFILE);
    androidInit({ config, environment });
    done(null, 'android is init');
  },
  uploadServer(environment, done) {
    const next = () => actions.restart(environment, done);
    const config = readConfig(CONFIGFILE);
    // const envConf = config.environments[environment];
    const sshConfig = getSshConfig(CONFIGFILE, environment);
    actionTitle(`uploading server bundle to ${environment}`);
    const buildDir = getBuildDir({ config, environment });
    execSync(`scp ${buildDir}/app.tar.gz ${sshConfig.user}@${sshConfig.host}:`, { stdio: 'inherit' });
    remoteExec(`
        rm -rf ~/app/last
        mv ~/app/bundle ~/app/last
        rm ~/app/current
        ln -s ~/app/bundle ~/app/current
        tar xfz app.tar.gz -C app
        pushd ~/app/bundle/programs/server
        npm install
        popd
      `, sshConfig, next).pipe(process.stdout);
  },
  deploy(environment, done) {
    actionTitle(`deploying ${environment}`);
    actions.buildServer(environment, () => {
      actions.uploadServer(environment, done);
    });
  },
};

export default actions;
