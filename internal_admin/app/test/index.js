require('app-module-path').addPath(`${__dirname}'./../../`);

import Minimist from 'minimist';
import Mocha from 'mocha';
import Glob from 'glob';
import './utils/dom';

const m = require('module');
const originalLoader = m._load;

m._load = function hookedLoader(request, parent, isMain) {
  if (request.match(/.jpeg|.jpg|.png|.scss$/)) {
    return { uri: request };
  }

  return originalLoader(request, parent, isMain);
};

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

var component = process.argv.length > 2 ? process.argv[2] : null;

Glob(
  `app/test/integration/**/${component ? component : '*'}.spec.js`,
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
