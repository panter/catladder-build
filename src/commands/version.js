import { version } from '../../package.json';

export default (__, done) => {
  done(null, `catladder version ${version}`);
};
