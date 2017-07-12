import printError from './print_error';

export default (error, message) => {
  printError('');
  printError('');
  printError(`╗ 🙀  ${message}  😿`);
  printError('╚═══════════════════════════════════════════════════════════════════════════════');
  printError('😾         🐁 🐁 🐁 🐁 🐁 🐁');
  console.log(`${error ? (error.message || error.reason) : ''}`);
  printError('');
  console.log(error ? error.stack : '');
  printError('════════════════════════════════════════════════════════════════════════════════');
};
