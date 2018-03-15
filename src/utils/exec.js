import { execSync } from 'child_process';

import printCommand from '../ui/print_command';

export default (cmd, options = {}) => {
  printCommand(cmd);
  return execSync(cmd, { stdio: 'inherit', ...options });
};
