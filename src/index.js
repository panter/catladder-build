import minimist from 'minimist';
import prompt from 'prompt';
import remoteExec from 'ssh-exec';
import _ from 'lodash';
import yaml from 'js-yaml';
import fs from 'fs';
import { execSync, spawnSync } from 'child_process';

import { version } from '../package.json';

const CONFIGFILE = '.catladder.yaml';
const options = minimist(process.argv.slice(2));
const writeConfig = config => fs.writeFile(CONFIGFILE, yaml.safeDump(config), (err) => {
  if (err) {
    return console.log(err);
  }
});
const readConfig = () => yaml.safeLoad(fs.readFileSync(CONFIGFILE));
const readPass = (path) => {
  try {
    return execSync(`pass show ${path}`, { stdio: [0], encoding: 'utf-8' });
  } catch (error) {
    if (error.message.indexOf('is not in the password store') !== -1) {
      return null;
    }
    throw error;
  }
};

const writePass = (path, input) => {
  console.log('writing to pass', path);
  execSync(`pass insert ${path} -m`, { input });
};

const editPass = (path) => {
  spawnSync('pass', ['edit', path], {
    stdio: 'inherit',
  });
};
const initSchema = {
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
    environments: {
      description: 'environments',
      type: 'string',
      required: true,
      pattern: /^[a-z,\s]+$/,
      default: 'staging, production',
      before: v => v.split(',').map(_.trim),
    },
  },
};


const environmentSchema = ({ environment, appname }) => ({
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
});

const defaultEnv = ({ config, envConfig }) => ({
  PORT: 8080,
  MONGO_URL: `mongodb://localhost/${config.appname}`,
  MONGO_OPLOG_URL: 'mongodb://localhost/local',
  MAIL_URL: 'smtp://localhost:25',
  ROOT_URL: envConfig.url,
  METEOR_SETTINGS: {
  },
});

const withDefaults = (schema, defaults = {}) => ({
  ...schema,
  properties: _.mapValues(schema.properties, (value, key) => ({
    ...value,
    default: () => defaults[key] || _.result(value, 'default'),
  })),
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

const actions = {
  init() {
    const config = (fs.existsSync(CONFIGFILE) && readConfig()) || {};
    prompt.start();
    prompt.get(withDefaults(initSchema, config), (error,
      { customer, appname, passPath, environments },
    ) => {
      const configFile = {
        appname,
        customer,
        passPath,
        environments: _.chain(environments).keyBy().mapValues(() => ({})).value(),
      };
      writeConfig(configFile);
      console.log(`created ${CONFIGFILE}`);
    });
  },
  setup(environments) {
    const config = readConfig();
    prompt.start();
    environments.forEach((environment) => {
      console.log('setting up', environment);
      const passPathForEnvVars = `${config.passPath}/${environment}.yaml`;
      // console.log(passPathForEnvVars);
      prompt.get(environmentSchema({ ...config, environment }), (error, envConfig) => {
        // write envConfig
        writeConfig({
          ...config,
          [environment]: envConfig,
        });
        let envVars = yaml.safeLoad(readPass(passPathForEnvVars));

        if (_.isEmpty(envVars)) {
          envVars = defaultEnv({ config, envConfig });
          writePass(passPathForEnvVars, yaml.safeDump(envVars));
        }

        editPass(passPathForEnvVars);
        const envSh = createEnvSh(yaml.safeLoad(readPass(passPathForEnvVars)));
        // create env.sh on server
        const sshConf = _.pick(envConfig, ['host', 'user', 'password', 'key']);
        remoteExec(`echo "${envSh}" > ~/app/env.sh`, sshConf);
        console.log('~/app/env.sh has ben written on ', envConfig.host);
        console.log('you need to restart the server');
      });
    });
  },
  restart(environments) {
    const config = readConfig();
    environments.forEach((environment) => {
      console.log(config, environment);
      remoteExec('');
    });
  },


};
const [command, ...args] = options._;
console.log('');
console.log('                                🐱 🔧');
console.log('         ╔═══ PANTER CATLADDER ═════');
console.log('       ╔═╝');
console.log(`     ╔═╝          v${version}`);
console.log('   ╔═╝');
console.log(' ╔═╝');
console.log('═╝');
console.log('');
if (actions[command]) {
  actions[command](args);
}
