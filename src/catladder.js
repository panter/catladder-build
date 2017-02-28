import _ from 'lodash';
import camelCase from 'camelcase';
import minimist from 'minimist';
import prompt from 'prompt';
import remoteExec from 'ssh-exec';
import yaml from 'js-yaml';

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

import { getSshConfig, readConfig, writeConfig, createEnvSh } from './config_utils';
import { initAndroid, prepareAndroidForStore, getAndroidBuildDir } from './android_build';
import { initSchema, environmentSchema } from './prompt_schemas';
import { intro, actionTitle } from './logs';
import { version } from '../package.json';
import { writePass, editPass, readPassYaml } from './pass_utils';

const CONFIGFILE = '.catladder.yaml';
const options = minimist(process.argv.slice(2));


const defaultEnv = ({ config, envConfig }) => ({
  PORT: 8080,
  MONGO_URL: `mongodb://localhost/${config.appname}`,
  MONGO_OPLOG_URL: 'mongodb://localhost/local',
  MAIL_URL: 'smtp://localhost:25',
  ROOT_URL: envConfig.url,
  METEOR_SETTINGS: {
  },
});


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
    const passPathForEnvVars = `${config.passPath}/${environment}/env.yaml`;
      // console.log(passPathForEnvVars);
    prompt.get(environmentSchema({ ...config, environment }), (error, envConfig) => {
        // write new envConfig
      config.environments = {
        ...config.environments,
        [environment]: {
          ...envConfig,
          envVarsPassPath: passPathForEnvVars,
        },
      };

      writeConfig(CONFIGFILE, {
        ...config,
        environments: {
          ...config.environments,
          [environment]: envConfig,
        },
      });
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
      const envSh = createEnvSh({ version, environment }, readPassYaml(passPathForEnvVars));
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
  restart(environment, done) {
    actionTitle(`restarting ${environment}`);
    remoteExec('./bin/nodejs.sh restart', getSshConfig(CONFIGFILE, environment), () => {
      done(null, 'server restarted');
    }).pipe(process.stdout);
  },
  buildServer(environment, done) {
    const config = readConfig(CONFIGFILE);
    const envConf = config.environments[environment];
    const buildDir = path.resolve(`${config.buildDir}/${environment}`);
    actionTitle(`building server ${environment}`);
    console.log(`build dir: ${buildDir}`);
    execSync('meteor npm install', { cwd: config.appDir, stdio: 'inherit' });
    execSync(
        `meteor build --server-only --server ${envConf.url} ${buildDir}`,
        { cwd: config.appDir, stdio: 'inherit' },
      );
    done(null, 'server built');
  },
  buildApps(environment, done) {
    const config = readConfig(CONFIGFILE);
    const envConf = config.environments[environment];
    const buildDir = path.resolve(`${config.buildDir}/${environment}`);
    actionTitle(`building mobile apps ${environment}`);
    console.log(`build dir: ${buildDir}`);
    execSync('meteor npm install', { cwd: config.appDir, stdio: 'inherit' });
    execSync(
        `meteor build --server ${envConf.url} ${buildDir}`,
        { cwd: config.appDir, stdio: 'inherit' },
      );
    // init android if it exists
    if (fs.existsSync(getAndroidBuildDir(config, environment))) {
      actions.prepareAndroidForStore(environment, done);
    } else {
      done(null, `apps created in ${buildDir}`);
    }
  },
  prepareAndroidForStore(environment, done) {
    const config = readConfig(CONFIGFILE);
    const outfile = prepareAndroidForStore(config, environment);
    done(null, `your apk is ready: ${outfile}`);
  },
  initAndroid(environment, done) {
    const config = readConfig(CONFIGFILE);
    initAndroid(config, environment);
    done(null, 'android is init');
  },
  uploadServer(environment, done) {
    const next = () => actions.restart(environment, done);
    const config = readConfig(CONFIGFILE);

      // const envConf = config.environments[environment];
    const sshConfig = getSshConfig(CONFIGFILE, environment);
    actionTitle(`uploading server bundle to ${environment}`);
    execSync(`scp ${config.buildDir}/${environment}/app.tar.gz ${sshConfig.user}@${sshConfig.host}:`, { stdio: 'inherit' });
    remoteExec(`
        rm -rf ~/app/last
        mv ~/app/bundle ~/app/last
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
const [commandRaw, environment] = options._;
const command = commandRaw && camelCase(commandRaw);

intro('');
intro('                                   🐱 🔧');
intro('         ╔═════ PANTER CATLADDER ════════');
intro('       ╔═╝');
intro(`     ╔═╝           v${version}`);
intro('   ╔═╝');
intro(' ╔═╝');
intro('═╝');
intro('');

const doneSuccess = (message) => {
  intro('');
  intro('');
  intro('╗');
  intro(`╚═╗ ${message}  👋 🐱`);
  intro('  ╚════════════════════════════════════════════════');
};

const doneError = (error, message) => {
  intro('');
  intro('');
  intro(`╗ 🙀  ${message}  😿`);
  intro('╚══════════════════════════════════════════════════');
  intro('😾         🐁 🐁 🐁 🐁 🐁 🐁');
  console.log(`${error && (error.message || error.reason)}`);
  intro('');
  console.log(error && error.stack);
  intro('═══════════════════════════════════════════════════');
};

const done = (error, message) => {
  if (!error) {
    doneSuccess(message);
  } else {
    doneError(error, message);
  }
};


if (actions[command]) {
  if (command !== 'init' && !environment) {
    doneError(null, 'please specify an environment');
  } else {
    try {
      actions[command](environment, done);
    } catch (e) {
      done(e, 'command failed');
    }
  }
} else {
  console.log('available commands: ');
  console.log('');
  console.log(_.keys(actions).join('\n'));
  done();
}
