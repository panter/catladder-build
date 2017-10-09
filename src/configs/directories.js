import path from 'path';

export const getBuildDir = ({ config, environment }) =>
  path.resolve(`${config.buildDir}/${environment}`);
export const getBuildDirDockerFile = ({ config, environment }) =>
  `${getBuildDir({ config, environment })}/Dockerfile`;

export const getIosBuildDir = ({ config, environment }) =>
  `${getBuildDir({ config, environment })}/ios`;
export const getIosBuildProjectFolder = ({ config, environment }) =>
  `${getIosBuildDir({ config, environment })}/project`;

export const passEnvFile = ({ config, environment }) =>
  `${config.passPath}/${environment}/env.yaml`;
