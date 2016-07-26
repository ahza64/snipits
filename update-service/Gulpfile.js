'use strict';

/**
 * @fileoverview The Gulp file.
 * Provides tasks to run jobs on the codebase.
 * Usage:
 *   'gulp [task]'
 *
 * Available tasks:
 *   gulp
 *   gulp deploy
 */

const gulp = require('gulp');
const gulpPrompt = require('gulp-prompt');
const shell = require('gulp-shell');
const openInBrowser = require('gulp-open');
const args   = require('yargs').argv;
const mocha = require('gulp-mocha');
const fs = require('fs');
const _ = require('lodash');
const nodemon = require('gulp-nodemon');

const TESTS = {
  UNIT: 'unit',
  INTEGRATION: 'integration'
};


/******************************************************************************/
/**********************************  TASKS  ***********************************/
/******************************************************************************/

/**
 * Runs the test swuite matching the glob pattern *_test.js.
 * @return {function()}
 */
function testsTask(testType) {
  let globs = [
    '!node_modules',
    '!node_modules/**'
  ];

  let hasTestType = typeof testType == 'string';

  if (!hasTestType || (testType == TESTS.INTEGRATION)) globs.push('./tests/integration-test.js');
  if (!hasTestType || (testType == TESTS.UNIT)) {
    if (!args || !args.file) globs.push('./**/*_test.js');
    else globs.push('./**/*' + args.file + '*_test.js');
  }

  return gulp.src(globs, { read: false })
  .pipe(mocha({}))
  .once('error', (err) => {
    console.error(err);
    process.exit(1);
  })
  .once('end', () => process.exit());
}



/******************************************************************************/
/***************************  GULP TASKS LIST *********************************/
/******************************************************************************/


gulp.task('test', testsTask);
gulp.task('test-integration', testsTask.bind(null, TESTS.INTEGRATION));
// To run a specific test, example: gulp test-unit --file users (to run users unit test)
gulp.task('test-unit', testsTask.bind(null, TESTS.UNIT));

gulp.task('server', () => {
  nodemon({
    script: 'bin/www',
    watch: ['bin', 'database', 'resources', 'routes', 'app.js'],
    env: { 'NODE_ENV': 'development' }
  });
});
gulp.task('default', ['server']);
