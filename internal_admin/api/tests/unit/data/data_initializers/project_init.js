
Company.findOrCreate({where : {id : company.id}, defaults: company}).then(() => {
  Admin.findOrCreate({where : {email : admin.email}, defaults: admin}).then(() => {
    Project.findOrCreate({ where : {id: project.id}, defaults: project}).then(() =>  {
      done();
      });
    });
  });
});
