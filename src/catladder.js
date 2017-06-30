import _ from 'lodash';
import camelCase from 'camelcase';
import minimist from 'minimist';
import prompt from 'prompt';
import remoteExec from 'ssh-exec';
import yaml from 'js-yaml';

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import rimraf from 'rimraf';
import { getSshConfig, readConfig, writeConfig, createEnvSh } from './config_utils';
import { androidInit, androidPrepareForStore, getAndroidBuildDir, getAndroidBuildProjectFolder } from './android_build';
import { initSchema, environmentSchema } from './prompt_schemas';
import { intro, actionTitle } from './logs';
import { version } from '../package.json';
import { writePass, editPass, readPassYaml } from './pass_utils';

const getBuildDir = ({ config, environment }) => path.resolve(`${config.buildDir}/${environment}`);
const getIosBuildDir = ({ config, environment }) => `${getBuildDir({ config, environment })}/ios`;
const getIosBuildProjectFolder = ({ config, environment }) => `${getIosBuildDir({ config, environment })}/project`;
const CONFIGFILE = '.catladder.yaml';
const options = minimist(process.argv.slice(2));
const passEnvFile = ({ config, environment }) => `${config.passPath}/${environment}/env.yaml`;

const execInstallNpmModules = ({ config }) => {
  execSync(`meteor ${config.useYarn ? 'yarn' : 'npm'} install`, { cwd: config.appDir, stdio: 'inherit' });
};

const execMeteorBuild = ({ config, environment }, args = []) => {
  const buildDir = getBuildDir({ config, environment });
  const envConf = config.environments[environment];
  // read build params
  const { buildEnv = {} } = envConf;
  const buildEnvString = _.map(buildEnv, (value, key) => `${key}='${value}'`).join(' ');
  execSync(
    `${buildEnvString} meteor build ${args.join(' ')} --server ${envConf.url} ${buildDir}`,
    { cwd: config.appDir, stdio: 'inherit' },
  );
};

const defaultEnv = ({ config }) => ({
  PORT: 8080,
  MONGO_URL: `mongodb://localhost/${config.appname}`,
  MONGO_OPLOG_URL: 'mongodb://localhost/local',
  MAIL_URL: 'smtp://localhost:25',
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
    const passPathForEnvVars = passEnvFile({ config, environment });
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
    actionTitle(`building server ${environment}`);
    execInstallNpmModules({ config });
    execMeteorBuild({ config, environment }, ['--server-only']);
    done(null, 'server built');
  },
  buildApps(environment, done) {
    const config = readConfig(CONFIGFILE);
    const buildDir = getBuildDir({ config, environment });
    actionTitle(`building mobile apps ${environment}`);
    console.log(`build dir: ${buildDir}`);

    // remove project folders if existing
    // otherwise apps might get bloated with old code
    if (fs.existsSync(getAndroidBuildProjectFolder({ config, environment }))) {
      rimraf.sync(getAndroidBuildProjectFolder({ config, environment }));
    }
    if (fs.existsSync(getIosBuildProjectFolder({ config, environment }))) {
      rimraf.sync(getIosBuildProjectFolder({ config, environment }));
    }
    execInstallNpmModules({ config });
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
