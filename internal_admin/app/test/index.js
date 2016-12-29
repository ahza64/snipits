require('app-module-path').addPath(`${__dirname}'./../../`);

import Minimist from 'minimist';
import Mocha from 'mocha';
import Glob from 'glob';
import './utils/dom';

const argv = Minimist(process.argv.slice(2), {
  alias: {
    c: 'component',
    g: 'grep',
  },
});

const mocha = new Mocha({
  grep: argv.grep ? argv.grep : undefined,
  reporter: 'dot',
});

Glob(
  `app/test/integration/**/${argv.component ? argv.component : '*'}.spec.js`,
  {},
  (err, files) => {
    files.forEach((file) => mocha.addFile(file));
    mocha.run((failures) => {
      process.on('exit', () => {
        process.exit(failures);
      });
    });
  }
);
