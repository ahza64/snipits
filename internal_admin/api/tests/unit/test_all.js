describe('All tests', function () {

  it('should run login test', function () {
    this.timeout(5555);
      require('./test.login/login');
  });

  it('should run project tests', function () {
    this.timeout(4444);
    require('./test.projects/project');
  });
});
