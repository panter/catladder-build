import _ from 'lodash';
import camelCase from 'camelcase';
import minimist from 'minimist';

import * as commands from './commands';
import doneError from './ui/done_error';
import doneSuccess from './ui/done_success';
import intro from './ui/intro';

// parse options
const options = minimist(process.argv.slice(2));

const [commandRaw, environment] = options._;

const command = options.v ? 'version' : commandRaw && camelCase(commandRaw);

// show intro
intro();

const done = (error, message) => {
  if (!error) {
    doneSuccess(message);
  } else {
    doneError(error, message);
  }
};

if (commands[command]) {
  if (command !== 'init' && command !== 'version' && command !== 'run' && !environment) {
    doneError(null, 'please specify an environment');
  } else {
    try {
      commands[command](environment, done);
    } catch (e) {
      done(e, 'command failed');
    }
  }
} else {
  console.log('available commands: ');
  console.log('');
  console.log(_.keys(commands).join('\n'));
  done();
}
