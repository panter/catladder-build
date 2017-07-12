import { version } from '../../package.json';
import printYellow from './print_yellow';

export default () => {
  printYellow('');
  printYellow('                                   🐱 🔧');
  printYellow('         ╔═════ PANTER CATLADDER ════════');
  printYellow('       ╔═╝');
  printYellow(`     ╔═╝           v${version}`);
  printYellow('   ╔═╝');
  printYellow(' ╔═╝');
  printYellow('═╝');
  printYellow('');
};
