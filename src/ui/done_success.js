import printYellow from './print_yellow';

export default (message = '') => {
  printYellow('');
  printYellow('');
  printYellow('╗');
  printYellow(`╚═╗ ${message}  👋 🐱`);
  printYellow('  ╚═════════════════════════════════════════════════════════════════════════════');
};
