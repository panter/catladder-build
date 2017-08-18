import _ from 'lodash';
import { execSync } from 'child_process';

// we always multiply by 10 so that you can manipulate it a bit
export const getBuildNumberFromGit = (factor = 10) => (
  Number(execSync('git rev-list --count HEAD')) * factor
);

export const getTagFromGit = () => (
  _.trim(execSync('git describe --tags --abbrev=0'))
);

export const sanitizeVersionString = versionString => (
  versionString.replace('v', '')
);

export const getVersionFromTag = () => {
  const parts = getTagFromGit().split('/');
  if (parts.length === 1) {
    return sanitizeVersionString(parts[0]);
  }
  return sanitizeVersionString(parts[parts.length - 1]);
};

export const getFullGitVersion = () => `${getVersionFromTag()}-${getBuildNumberFromGit()}`;

export const getFullVersionString = env => `${env}-${getFullGitVersion()}`;
