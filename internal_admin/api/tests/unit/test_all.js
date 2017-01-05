
describe('All tests', function () {

  it('should run login test', function (done) {
    setTimeout(function () {
      require('./test.login/login')(done);
    }, 3000);
  });

  it('should run project tests', function () {
    setTimeout(function () {
      require('./test.projects/project');
    }, 3000);
  });


// require('./test.user/user');
// require('./test.company/company');
// require('./test.watcher/watcher');
});
