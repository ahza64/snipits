/* globals describe, it */
// const co = require('co');
const fs = require('fs');
const baker = require('dsp_lib/baker');
const JsDiff = require('diff');
require('colors');

// const config = require('dsp_config/config').get({ log4js: false });

const stdout = console.log;
const output = [];
console.log = function mylog(...args) {
  args = args.map((a) => { return JSON.stringify(a, null, 4); });
  output.push(args.join(' '));
  stdout(args.join(' '));
};


/**
 * This is a function that should be given to the tester and runs the test
 * @callback FunctionalTest~run_test
 * @param {FunctionalTest~done} done  Function that should be called when test is done running.
 */

/**
 * This callback that should be called when the test is done running
 * @callback FunctionalTest~done
 * @param {Boolean} update         If true done updates the test case instead of comparing
 */


/**
 * @param {String} file_path path to test output file.  This file is the test case and gets updated if requested.
 * @param {FunctionalTest~run_test} run_test - Call this function when test is done running.
 */
function functionalTest(file_path, run_test) {
  run_test((update) => {
    const newText = output.join("\n");
    if (update) {
      fs.writeFile(file_path, newText);
    } else {
      fs.readFile(file_path, (err, text) => {
        const oldText = text.toString();
        const diff = JsDiff.diffWords(oldText, newText);
        if (diff.length > 1) {
          diff.forEach((part) => {
            // green for additions, red for deletions, grey for common parts
            let color = part.added ? 'green' : 'grey';
            color = part.removed ? 'red' : color;
            process.stderr.write(part.value[color]);
          });
          console.error();
          throw new Error("Functional Test Failed!");
        } else {
          process.stderr.write("Functional Test Success!");
        }
      });
    }
  });
}

module.exports = functionalTest;


function setup() {
  functionalTest('output', (done) => {
    console.log("RUN THIS TESTA");
    console.log("RUN THIS TESTB");
    console.log("RUN THIS TESTC");
    console.log("RUN THIS TESTD");
    done(true);
  });
}
function sucess() {
  functionalTest('output', (done) => {
    console.log("RUN THIS TESTA");
    console.log("RUN THIS TESTB");
    console.log("RUN THIS TESTC");
    console.log("RUN THIS TESTD");
    done();
  });
}
function fail() {
  functionalTest('output', (done) => {
    console.log("RUN THIS TESTA");
    console.log("RUN THIS TEST2");
    console.log("RUN THIS TESTC");
    console.log("RUN THIS TESTD");
    done();
  });
}

if (require.main === module) {
  baker.command(setup);
  baker.command(sucess);
  baker.command(fail);
  baker.run();
}

