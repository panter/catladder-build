import colors from 'colors/safe';

export default (line) => {
  console.log();
  console.log(colors.green(`$ ${line}`));
};
