import minimist from 'minimist';
import prompt from 'prompt';
import colors from 'colors/safe';
import remoteExec from 'ssh-exec';
import _ from 'lodash';
import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';
import { execSync, spawnSync } from 'child_process';

import { version } from '../package.json';

const intro = line => console.log(colors.yellow(line));
const actionTitle = (title) => {
  intro('');
  intro(`🐱 🔧 ${title}`);
  intro('');
};

const CONFIGFILE = '.catladder.yaml';
const options = minimist(process.argv.slice(2));
const writeConfig = (config) => {
  const theyaml = yaml.safeDump(config);
  fs.writeFileSync(CONFIGFILE, theyaml);
};
const readConfig = () => yaml.safeLoad(fs.readFileSync(CONFIGFILE));
const readPass = (passPath) => {
  try {
    return execSync(`pass show ${passPath}`, { stdio: [0], encoding: 'utf-8' });
  } catch (error) {
    if (error.message.indexOf('is not in the password store') !== -1) {
      return null;
    }
    throw error;
  }
};

const writePass = (passPath, input) => {
  console.log('writing to pass', passPath);
  execSync(`pass insert ${path} -m`, { input });
};

const editPass = (passPath) => {
  spawnSync('pass', ['edit', passPath], {
    stdio: 'inherit',
  });
};

const withDefaults = (schema, defaults = {}) => ({
  ...schema,
  properties: _.mapValues(schema.properties, (value, key) => ({
    ...value,
    default: () => defaults[key] || _.result(value, 'default'),
  })),
});

const initSchema = config => withDefaults({
  properties: {
    customer: {
      description: 'Customer kürzel',
      required: true,
      default: 'pan',
    },
    appname: {
      description: 'App name (for dbs, filenames, etc.)',
      type: 'string',
      required: true,
      pattern: /^[a-zA-Z]+$/,
    },
    passPath: {
      description: 'Path in pass',
      required: true,
      default: () => `${prompt.history('customer').value}/${prompt.history('appname').value}`,
    },
    appDir: {
      description: 'app directory',
      type: 'string',
      default: './app',
    },
    buildDir: {
      description: 'build directory',
      type: 'string',
      default: './build',
    },
  },
}, config);

const environmentSchema = ({ environment, appname, ...config }) => withDefaults({
  properties: {
    host: {
      description: 'ssh host',
      type: 'string',
      required: true,
      default: `${appname}-${environment}.panter.biz`,
    },
    user: {
      description: 'ssh user',
      default: 'app',
    },
    url: {
      description: 'full url',
      default: () => `https://${prompt.history('host').value}`,
    },
  },
}, config[environment]);

const defaultEnv = ({ config, envConfig }) => ({
  PORT: 8080,
  MONGO_URL: `mongodb://localhost/${config.appname}`,
  MONGO_OPLOG_URL: 'mongodb://localhost/local',
  MAIL_URL: 'smtp://localhost:25',
  ROOT_URL: envConfig.url,
  METEOR_SETTINGS: {
  },
});


const createEnvSh = (envVars) => {
  const getSanitziedValue = (value) => {
    if (_.isObject(value)) {
      return JSON.stringify(value);
    }
    return value;
  };
  return _.keys(envVars).map((key) => {
    const value = getSanitziedValue(envVars[key]);
    return `export ${key}='${value}'`;
  }).join('\n');
};

const getSshConfig = (environment) => {
  const config = readConfig();
  return _.pick(
    config.environments[environment],
    ['host', 'user', 'password', 'key'],
  );
};

const actions = {
  init(__, done) {
    const configOld = (fs.existsSync(CONFIGFILE) && readConfig()) || {};
    prompt.start();
    prompt.get(initSchema(configOld), (error,
      configNew,
    ) => {
      const config = {
        ...configOld,
        ...configNew,
      };
      writeConfig(config);
      const buildDir = path.resolve(config.buildDir);
      if (!fs.existsSync(buildDir)) {
        fs.mkdirSync(buildDir);
      }
      console.log(`created ${CONFIGFILE}`);
      done();
    });
  },
  setup(environments, done) {
    const config = readConfig();
    prompt.start();
    environments.forEach((environment) => {
      actionTitle(`setting up ${environment}`);
      const passPathForEnvVars = `${config.passPath}/${environment}.yaml`;
      // console.log(passPathForEnvVars);
      prompt.get(environmentSchema({ ...config, environment }), (error, envConfig) => {
        // write new envConfig
        config.environments = {
          ...config.environments,
          [environment]: envConfig,
        };

        writeConfig({
          ...config,
          environments: {
            ...config.environments,
            [environment]: envConfig,
          },
        });
        // update env-vars in path
        // first get current vars in path
        let envVars = yaml.safeLoad(readPass(passPathForEnvVars));
        // if envVars do not exist yet, create new one and write to pass
        if (_.isEmpty(envVars)) {
          envVars = defaultEnv({ config, envConfig });
          writePass(passPathForEnvVars, yaml.safeDump(envVars));
        }
        // open editor to edit the en vars
        editPass(passPathForEnvVars);
        // load changed envVars and create env.sh on server
        const envSh = createEnvSh(yaml.safeLoad(readPass(passPathForEnvVars)));
        // create env.sh on server
        remoteExec(`echo "${envSh.replace(/"/g, '\\"')}" > ~/app/env.sh`, getSshConfig(environment), (err) => {
          if (err) {
            throw err;
          }
          console.log('');
          console.log('~/app/env.sh has ben written on ', envConfig.host);
          console.log('you need to restart the server');
          done();
        }).pipe(process.stdout);
      });
    });
  },
  restart(environment, done) {
    actionTitle(`restarting ${environment}`);
    remoteExec('./bin/nodejs.sh restart', getSshConfig(environment), done).pipe(process.stdout);
  },
  build(environment, done) {
    const config = readConfig();

    const envConf = config.environments[environment];
    const buildDir = path.resolve(`${config.buildDir}/${environment}`);
    actionTitle(`building ${environment}`);
    console.log(`build dir: ${buildDir}`);
    execSync('meteor npm install', { cwd: config.appDir, stdio: [0, 1, 2] });
    execSync(
        `meteor build --server ${envConf.url} ${buildDir}`,
        { cwd: config.appDir, stdio: [0, 1, 2] },
      );
    done();
  },
  deploy(environment, done) {
    const config = readConfig();

      // const envConf = config.environments[environment];
    const sshConfig = getSshConfig(environment);
    actionTitle(`deploying ${environment}`);
    execSync(`scp ${config.buildDir}/${environment}/app.tar.gz ${sshConfig.user}@${sshConfig.host}:`, { stdio: [0, 1, 2] });
    remoteExec(`
        rm -rf ~/app/last
        mv ~/app/bundle ~/app/last
        tar xfz app.tar.gz -C app
        pushd ~/app/bundle/programs/server
        npm install
        popd
      `, sshConfig, done).pipe(process.stdout);
  },
  'build-deploy': function (environment, done) {
    actions.build(environment, () => {
      actions.deploy(environment, done);
    });
  },


};
const [command, environment] = options._;

intro('');
intro('                                🐱 🔧');
intro('         ╔═══ PANTER CATLADDER ═════');
intro('       ╔═╝');
intro(`     ╔═╝          v${version}`);
intro('   ╔═╝');
intro(' ╔═╝');
intro('═╝');
intro('');

const done = () => {
  intro('');
  intro('╗');
  intro('╚═╗                      👋 🐱');
  intro('  ╚══════════════════════════════════');
};
if (actions[command]) {
  actions[command](environment, done);
} else {
  console.log('available commands: ');
  console.log('');
  console.log(_.keys(actions).join('\n'));
  done();
}
