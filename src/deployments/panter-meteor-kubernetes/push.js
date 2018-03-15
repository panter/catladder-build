import fs from 'fs';

import { template, map, isObject, toString } from 'lodash';

import { getBuildDir, getBuildDirDockerFile, passEnvFile } from '../../configs/directories';
import { getFullVersionString } from '../../utils/git_utils';
import { readConfig } from '../../utils/config_utils';
import { readPassYaml } from '../../utils/pass_utils';
import actionTitle from '../../ui/action_title';
import exec from '../../utils/exec';

const createDockerFile = ({ config, environment }) => {
  const dockerFile = getBuildDirDockerFile({ config, environment });
  fs.writeFileSync(
    dockerFile,
    `
FROM node:8.9.1
ADD app.tar.gz /app
RUN cd /app/bundle/programs/server && npm install
WORKDIR /app/bundle
EXPOSE 8888
CMD ["node", "main.js"]
  `,
  );
  return dockerFile;
};
/* todo generate dockerfile and pipe in * */
/*
const dockerFile = `
  FROM node:4.8.4
  ADD build/production/app.tar.gz /app
  RUN cd /app/bundle/programs/server && npm install
  WORKDIR /app/bundle
  EXPOSE 8888
  CMD ["node", "main.js"]
` */

const sanitizeKubeValue = value => (isObject(value) ? JSON.stringify(value) : toString(value));

export default (environment, done) => {
  actionTitle(`  🎶    👊   push it real good ! 👊   🎶   ${environment} 🎶 `);
  const config = readConfig();
  const passPathForEnvVars = passEnvFile({ config, environment });
  const passEnv = readPassYaml(passPathForEnvVars);
  const { dockerEndPoint = 'gcr.io/skynet-164509', appname = 'unknown app' } = config;

  const dockerFile = createDockerFile({ config, environment });
  const buildDir = getBuildDir({ environment, config });
  const dockerBuildCommand = `docker build -t ${appname} -f ${dockerFile} ${buildDir}`;

  exec(dockerBuildCommand);

  const versionTag = getFullVersionString(environment);
  const fullImageName = `${dockerEndPoint}/${appname}:${versionTag}`;
  exec(`docker tag ${appname} ${fullImageName}`);
  exec(`gcloud docker -- push ${fullImageName}`);

  const {
    url,
    deployment: { env: commonDeploymentEnv, kubeDeployments = [] },
  } = config.environments[environment];

  kubeDeployments.forEach((deployment) => {
    const { file, env: deploymentEnv = {} } = deployment;
    const compiled = template(fs.readFileSync(file));
    const fullEnv = {
      ...passEnv,
      ROOT_URL: url,
      ...commonDeploymentEnv,
      ...deploymentEnv,
    };

    const kubeEnv = map(fullEnv, (value, name) => ({ name, value: sanitizeKubeValue(value) }));
    const yaml = compiled({
      image: fullImageName,
      env: JSON.stringify(kubeEnv),
    });
    console.log('apply', yaml);
    exec('kubectl apply -f -', { input: yaml, stdio: ['pipe', 1, 2] });
  });
  done(null, 'done');
};
