import colors from 'colors/safe';

export const intro = line => console.log(colors.yellow(line));
export const actionTitle = (title) => {
  intro('');
  intro(`🐱 🔧 ${title}`);
  intro('');
};
