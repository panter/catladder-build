import { editPass } from '../utils/pass_utils';
import { passEnvFile } from '../configs/directories';
import { readConfig } from '../utils/config_utils';

const CONFIGFILE = '.catladder.yaml';

export default (environment, done) => {
  const config = readConfig(CONFIGFILE);
  const passPathForEnvVars = passEnvFile({ config, environment });
  editPass(passPathForEnvVars);
  done(null, 'env in pass edited. Remember that this not updates the server. Use catladder setup <env> to do so');
};
