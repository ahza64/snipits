describe('All tests', function () {

  describe('should run login test', function () {
  setTimeout(function () {
    require('./test.login/login');
  }, 5555);
});

  describe('should run project tests', function (done) {
  setTimeout(function () {
      require('./test.projects/project');
      done();
    }, 5555);
  });
});
