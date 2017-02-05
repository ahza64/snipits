// Modules
const koa = require('koa');
const router = require('koa-router')();
const permissions = require('./permissions');

// App
const app = koa();

// Constants
const ACTIVE = 'active';
const INACTIVE = 'inactive';

// Collection
const Projects = require('dsp_shared/database/model/ingestion/tables').work_projects;

// Create a project
router.post(
  '/project',
  function*() {
    var body = this.request.body;
    var companyId = body.companyId;

    if (permissions.has(this.req.user, companyId)) {
      var project = yield Projects.findOne({
        where: { name: { ilike: body.name }, companyId: companyId },
        raw: true
      });

      if(project) {
        this.body = project;
      } else {
        var project = {
          name: body.name,
          status: ACTIVE,
          companyId: companyId
        };
        this.body = yield Projects.create(project);
      }
    } else {
      this.throw(403);
    }
  }
);

// Delete project by id
router.delete(
  '/project/:id',
  function*() {
    var project = yield Projects.findOne({ where: { id: this.params.id }, raw: true });

    if(project) {
      if (permissions.has(this.req.user, project.companyId)) {
        yield Projects.destroy({ where: { id: this.params.id }, raw: true });
        this.throw(200);
      } else {
        this.throw(403);
      }
    } else {
      this.throw(404);
    }
  }
);

// Get projects by companyId
router.get(
  '/projects/:companyId',
  function*() {
    var companyId = this.req.user.companyId;
    if (!companyId) {
      return this.body = [];
    }
    if (permissions.has(this.req.user, companyId)) {
      var projects = [];
      try {
        projects = yield Projects.findAll({
          where: { companyId: companyId },
          raw: true
        });
      } catch (err) {
        console.error(err);
      }

      this.body = projects;
    } else {
      this.throw(403);
    }
  }
);

router.put(
  '/project/:id/deactivate',
  function*() {
    try {
      var project = yield Projects.find({ where: { id: this.params.id } });
      if (permissions.has(this.req.user, project.companyId)) {
        yield project.updateAttributes({ status: INACTIVE });
        this.body = project;
      } else {
        this.throw(403);
      }
    } catch (err) {
      console.error(err);
      this.throw(500);
    }
  }
);

router.put(
  '/project/:id/activate',
  function*() {
    try {
      var project = yield Projects.find({ where: { id: this.params.id } });
      if (permissions.has(this.req.user, project.companyId)) {
        yield project.updateAttributes({ status: ACTIVE });
        this.body = project;
      } else {
        this.throw(403);
      }
    } catch (err) {
      console.error(err);
      this.throw(500);
    }
  }
);


app.use(router.routes());

module.exports = app;
