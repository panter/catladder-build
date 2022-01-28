import _ from "lodash";
import prompt from "prompt";
import yaml from "js-yaml";

import { environmentSchema } from "../configs/prompt_schemas";
import { passEnvFile } from "../configs/directories";
import { readConfig, writeConfig } from "../utils/config_utils";
import { writePass, editPass, readPassYaml } from "../utils/pass_utils";
import actionTitle from "../ui/action_title";
import defaultEnv from "../configs/default_env";
import getDeploymentCommand from "../deployments/get_deployment_command";

const CONFIGFILE = ".catladder-build.yaml";

export default (environment, done) => {
  const config = readConfig();
  prompt.start();

  actionTitle(`setting up ${environment}`);
  const passPathForEnvVars = passEnvFile({ config, environment });
  // console.log(passPathForEnvVars);
  const oldEnvConfig = _.get(config, ["environments", environment], {});
  prompt.get(
    environmentSchema({ ...config, environment }),
    (error, envConfig) => {
      // write new envConfig
      config.environments = {
        ...config.environments,
        [environment]: {
          ...oldEnvConfig, // merge with old config
          ...envConfig,
        },
      };
      writeConfig(CONFIGFILE, config);
      // update env-vars in path
      // first get current vars in path
      let envVars = readPassYaml(passPathForEnvVars);
      // if envVars do not exist yet, create new one and write to pass
      if (_.isEmpty(envVars)) {
        envVars = defaultEnv({ config, envConfig });
        writePass(passPathForEnvVars, yaml.safeDump(envVars));
      }
      // open editor to edit the en vars
      editPass(passPathForEnvVars);

      const command = getDeploymentCommand(environment, "applyConfig");
      if (command) command(environment, done);
      else {
        done();
      }
    }
  );
};
