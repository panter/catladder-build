import { getFullVersionString } from '../../utils/git_utils';
import { readConfig } from '../../utils/config_utils';

export default (environment, done) => {
  const { appname = 'unknown app' } = readConfig();
  console.log('would do the following if implemented: ');
  console.log('(but you can do it manually! 😽  )');
  console.log('  ');
  console.log(`docker build -t ${appname} .`);
  const versionTag = getFullVersionString(environment);
  const fullImageName = `gcr.io/skynet-164509/${appname}:${versionTag}`;
  console.log(`docker tag ${appname} ${fullImageName}`);
  console.log(`docker push ${fullImageName}`);
  console.log(`generate or adjust: kube/${environment}/deployment.${appname}_worker.yml (add tag ${versionTag})`);
  console.log(`generate or adjust: kube/${environment}/deployment.${appname}_web.yml (add tag ${versionTag})`);
  console.log(`kubectl apply -f kube/${environment}/deployment.${appname}_worker.yml`);
  console.log(`kubectl apply -f kube/${environment}/deployment.${appname}_web.yml`);
  done(null, 'done');
};
