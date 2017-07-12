import _ from 'lodash';
import camelCase from 'camelcase';
import minimist from 'minimist';

import actions from './actions';
import doneError from './ui/done_error';
import doneSuccess from './ui/done_success';
import intro from './ui/intro';

// parse options
const options = minimist(process.argv.slice(2));
const [commandRaw, environment] = options._;
const command = commandRaw && camelCase(commandRaw);

// show intro
intro();


const done = (error, message) => {
  if (!error) {
    doneSuccess(message);
  } else {
    doneError(error, message);
  }
};

if (actions[command]) {
  if (command !== 'init' && !environment) {
    doneError(null, 'please specify an environment');
  } else {
    try {
      actions[command](environment, done);
    } catch (e) {
      done(e, 'command failed');
    }
  }
} else {
  console.log('available commands: ');
  console.log('');
  console.log(_.keys(actions).join('\n'));
  done();
}
