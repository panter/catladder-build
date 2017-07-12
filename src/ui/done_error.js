import printYellow from './print_yellow';

export default (error, message) => {
  printYellow('');
  printYellow('');
  printYellow(`╗ 🙀  ${message}  😿`);
  printYellow('╚══════════════════════════════════════════════════');
  printYellow('😾         🐁 🐁 🐁 🐁 🐁 🐁');
  console.log(`${error && (error.message || error.reason)}`);
  printYellow('');
  console.log(error && error.stack);
  printYellow('═══════════════════════════════════════════════════');
};
