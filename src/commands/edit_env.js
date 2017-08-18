import { editPass } from '../utils/pass_utils';
import { passEnvFile } from '../configs/directories';
import { readConfig } from '../utils/config_utils';



export default (environment, done) => {
  const config = readConfig();
  const passPathForEnvVars = passEnvFile({ config, environment });
  editPass(passPathForEnvVars);
  done(null, 'env in pass edited. Remember that this not updates the server. Use catladder setup <env> to do so');
};
