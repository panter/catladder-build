environmentSchemaimport _ from 'lodash';
import prompt from 'prompt';


const withDefaults = (schema, defaults = {}) => ({
  ...schema,
  properties: _.mapValues(schema.properties, (value, key) => ({
    ...value,
    default: () => defaults[key] || _.result(value, 'default'),
  })),
});

export const initSchema = config => withDefaults({
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
    androidBuildToolVersion: {
      description: 'android build tool version',
      type: 'string',
      default: '25.0.2',
    },
    useYarn: {
      description: 'use yarn to build (false: use npm)',
      type: 'boolean',
      default: true,
    },
  },
}, config);

export const environmentSchema = ({ environment, appname, ...config }) => withDefaults({
  properties: {
    host: {
      description: 'ssh host (deprecated, only for classic hosting)',
      type: 'string',
      required: true,
      default: `${appname}-${environment}.panter.biz`,
    },
    user: {
      description: 'ssh user (deprecated, only for classic hosting)',
      default: 'app',
    },
    url: {
      description: 'full url',
      default: () => `https://${prompt.history('host').value}`,
    },
    androidKeystore: {
      description: 'android keystore file',
      type: 'string',
      default: './android.keystore',
    },
    androidKeyname: {
      description: 'Android keystore name / alias',
      default: `${appname}-${environment}`,
    },
    androidDName: {
      description: 'android dname for key',
      type: 'string',
      default: () => 'cn=Panter, ou=Panter, o=Panter, c=CH',
    },
  },
}, _.get(config, ['environments', environment]));
