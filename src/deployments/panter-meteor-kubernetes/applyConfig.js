import fs from 'fs';

import { template, map, isObject, toString, merge } from 'lodash';
import { getKubernetesImageNameFromConfig } from './libs/utils';
import { passEnvFile } from '../../configs/directories';
import { readConfig } from '../../utils/config_utils';
import { readPassYaml } from '../../utils/pass_utils';
import actionTitle from '../../ui/action_title';
import exec from '../../utils/exec';

const sanitizeKubeValue = value => (isObject(value) ? JSON.stringify(value) : toString(value));

export default (environment, done) => {
  actionTitle(`applying kubernetes config ${environment}  💫 `);
  const config = readConfig();
  const imageName = getKubernetesImageNameFromConfig(config, environment);
  actionTitle(`imageName: ${imageName}`);

  const passPathForEnvVars = passEnvFile({ config, environment });
  const passEnv = readPassYaml(passPathForEnvVars);

  const {
    url,
    env: environmentEnv,
    deployment: { env: commonDeploymentEnv, kubeDeployments = [] },
  } = config.environments[environment];

  kubeDeployments.forEach((deployment) => {
    const { file, env: deploymentEnv = {} } = deployment;
    const compiled = template(fs.readFileSync(file));
    const baseEnv = {
      ROOT_URL: url,
      METEOR_SETTINGS: {
        public: {
          KUBERNETES_IMAGE: imageName, // useful to show the actual image on the client
        },
      },
    };
    const fullEnv = merge({}, baseEnv, environmentEnv, commonDeploymentEnv, deploymentEnv, passEnv);
    console.log(fullEnv);
    process.exit();
    const kubeEnv = map(fullEnv, (value, name) => ({ name, value: sanitizeKubeValue(value) }));
    const yaml = compiled({
      image: imageName,
      env: JSON.stringify(kubeEnv),
    });
    console.log('apply', yaml);
    exec('kubectl apply -f -', { input: yaml, stdio: ['pipe', 1, 2] });
  });
  done(null, 'done');
};
