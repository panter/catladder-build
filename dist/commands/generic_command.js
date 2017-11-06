"use strict";

// draft
/*
sample config


customer: pvl
appname: biketowork
passPath: pvl/biketowork
appDir: ./app
buildDir: ./build
environments:
  staging:
    url: 'https://biketowork-staging.panter.biz'
    commands:
      deploy-web:
        env:
          MONGO_URL: 'mongodb://mongo-0.mongo,mongo-1.mongo,mongo-2.mongo,mongo-3.mongo:27017/biketowork?replicaSet=oplog'
          PORT: '8080'
          MONGO_OPLOG_URL: 'mongodb://mongo-0.mongo,mongo-1.mongo,mongo-2.mongo,mongo-3.mongo:27017/local?replicaSet=oplog'
        tasks:
          web:
            type: panter-meteor-kubernetes
            template: kube/staging/deployment.biketowork_web.yml
          worker:
            type: panter-meteor-kubernetes
            template: kube/staging/deployment.biketowork_worker.yml
            env:
              BACKGROUND_JOBS_ENABLED: true
      build-apps:
        type: panter-meteor-cordova
        meteorBuildEnv:
          CORDOVA_APP_NAME: bike to work staging
          CORDOVA_APP_ID: ch.biketowork.biketowork-staging


    #host: biketowork-staging.panter.biz
    #user: app
    #url: 'https://biketowork-staging.panter.biz'
    #androidKeystore: ./android.keystore
    #androidKeyname: biketowork
    #androidDName: 'cn=Panter, ou=Panter, o=Panter, c=CH'
    #buildEnv:
    #  CORDOVA_APP_NAME: bike to work staging
    #  CORDOVA_APP_ID: ch.biketowork.biketowork-staging

  production:
    host: biketowork-production.panter.biz
    user: app
    url: 'https://www.biketowork.ch'
    androidKeystore: ./android.keystore
    androidKeyname: biketowork
    androidDName: 'cn=Panter, ou=Panter, o=Panter, c=CH'
    buildEnv:
      CORDOVA_APP_NAME: bike to work
      CORDOVA_APP_ID: ch.biketowork.biketowork
androidBuildToolVersion: 25.0.2


const doCommand = (environment, { tasks, type, ...commandProps }) => {
  if (!empty(tasks) && !empty(type)) {
    throw new Error('either define tasks or define a type (then its one task), but not both');
  }
  if (empty(tasks)) {
    doTask(environment, type, commandProps);
  } else {
    forEach(tasks, ({ type, ...taskProps }, key) => {
      const props = merge({}, taskProps, commandProps);
      doTask(environment, type, props);
    });
  }
};

const doTask = (environment, type, props) => {
  const task = TASKS[taskDef.type];
  task(environment, props);
};
*/
//# sourceMappingURL=generic_command.js.map