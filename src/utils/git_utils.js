import _ from 'lodash';
import { execSync } from 'child_process';

// we always multiply by 10 so that you can manipulate it a bit
export const getBuildNumberFromGit = (factor = 10) => (
  Number(execSync('git rev-list --count HEAD')) * factor
);

export const getTagFromGit = () => (
  _.trim(execSync('git describe --tags'))
);
