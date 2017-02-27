import minimist from 'minimist';
import prompt from 'prompt';
// import remoteExec from 'ssh-exec';
import _ from 'lodash';
import yaml from 'js-yaml';
import fs from 'fs';
import { execSync } from 'child_process';

const options = minimist(process.argv.slice(2));
const writeConfig = config => fs.writeFile('.catladder.yaml', yaml.safeDump(config), (err) => {
  if (err) {
    return console.log(err);
  }
});
const readConfig = () => yaml.safeLoad(fs.readFileSync('.catladder.yaml'));
const readPass = (path) => {
  try {
    return execSync(`pass show ${path}`, { stdio: [0] });
  } catch (error) {
    if (error.message.indexOf('is not in the password store') !== -1) {
      return null;
    }
    throw error;
  }
};

const writePass = (path, content) => execSync(`pass insert ${path}`, { stdin: content });
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
    sshHost: {
      description: 'ssh host',
      type: 'string',
      required: true,
      default: `${appname}-${environment}.panter.biz`,
    },
    sshUsername: {
      description: 'ssh user',
      default: 'app',
    },
    url: {
      description: 'full url',
      default: () => `https://${prompt.history('sshHost').value}`,
    },
  },
});

const envVarsSchema = ({ config, envConfig }) => ({
  properties: {
    PORT: {
      required: true,
      pattern: /^[0-9]+$/,
      default: 8080,
    },
    MONGO_URL: {
      required: true,
      default: `mongodb://localhost/${config.appname}`,
    },
    MONGO_OPLOG_URL: {
      required: true,
      default: 'mongodb://localhost/local',
    },
    MAIL_URL: {
      required: true,
      default: 'smtp://localhost:25',
    },
    ROOT_URL: {
      required: true,
      default: envConfig.url,
    },
  },
});

const withDefaults = (schema, defaults = {}) => ({
  ...schema,
  properties: _.mapValues(schema.properties, (value, key) => ({
    ...value,
    default: () => defaults[key] || _.result(value, 'default'),
  })),
});

const actions = {
  init() {
    prompt.start();
    prompt.get(initSchema, (error, { customer, appname, passPath, environments }) => {
      const configFile = {
        appname,
        customer,
        passPath,
        environments: _.chain(environments).keyBy().mapValues(() => ({})).value(),
      };
      console.log('writing');
      console.log(writeConfig(configFile));
    });
  },
  setup(environments) {
    const config = readConfig();
    console.log(environments);
    prompt.start();
    environments.forEach((environment) => {
      const passPathForEnvVars = `${config.passPath}/${environment}`;
      // console.log(passPathForEnvVars);

      const envVarsOld = readPass(passPathForEnvVars) || {};


      prompt.get(environmentSchema({ ...config, environment }), (error, envConfig) => {
        //

        prompt.get(withDefaults(envVarsSchema({ config, envConfig, environment }), envVarsOld),
        (varsError, envVars) => {
          if (varsError) {
            throw varsError;
          }
          writePass(passPathForEnvVars, envVars);
          // create env object, should be flat key value
          const envVarsSanitized = _.mapValues(envVars, (envVar) => {
            if (_.isObject(envVar)) {
              return JSON.stringify(envVar);
            }
            return envVar;
          });

          console.log(envVarsSanitized);
        });
      });
    });
  },

};
const [command, ...environments] = options._;
if (actions[command]) {
  actions[command](environments);
}
