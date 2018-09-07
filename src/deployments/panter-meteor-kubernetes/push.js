import fs from 'fs';

import { generateKubernetesImageName, writeImageNameToConfig } from './libs/utils';
import { getBuildDir, getBuildDirDockerFile } from '../../configs/directories';
import { readConfig } from '../../utils/config_utils';
import actionTitle from '../../ui/action_title';
import applyConfig from './applyConfig';
import exec from '../../utils/exec';

const createDockerFile = ({ nodeVersion, config, environment }) => {
  const dockerFile = getBuildDirDockerFile({ config, environment });

  fs.writeFileSync(
    dockerFile,
    `
FROM node:${nodeVersion}
ADD bundle /app
RUN cd /app/programs/server && npm install
WORKDIR /app
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

const getNodeVersion = ({ environment, config }) => {
  const buildDir = getBuildDir({ environment, config });
  const meteorNodeVersionFile = `${buildDir}/bundle/.node_version.txt`;
  const versionString = exec(`cat ${meteorNodeVersionFile}`, { stdio: [0], encoding: 'utf-8' });
  return versionString.replace('v', '');
};

export default (environment, done) => {
  actionTitle(`  🎶    👊   push it real good ! 👊   🎶   ${environment} 🎶 `);
  const config = readConfig();
  const fullImageName = generateKubernetesImageName(config, environment);

  actionTitle(`image ${fullImageName}`);

  const { appname = 'unknown app' } = config;
  const nodeVersion = getNodeVersion({ environment, config });
  console.log(`using node version: ${nodeVersion}`);
  // const nodeVersion = '8.9.1';
  const dockerFile = createDockerFile({ nodeVersion, config, environment });
  const buildDir = getBuildDir({ environment, config });
  const dockerBuildCommand = `docker build -t ${appname} -f ${dockerFile} ${buildDir}`;

  exec(dockerBuildCommand);

  writeImageNameToConfig(config, environment, fullImageName);

  exec(`docker tag ${appname} ${fullImageName}`);
  exec(`gcloud docker -- push ${fullImageName}`);

  applyConfig(environment, done);
};
