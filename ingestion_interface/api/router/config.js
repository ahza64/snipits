// Modules
const koa = require('koa');
const router = require('koa-router')();
const permissions = require('./permissions');

// App
const app = koa();

// Collection
const Configs = require('dsp_shared/database/model/ingestion/tables').ingestion_configurations;
const Projects = require('dsp_shared/database/model/ingestion/tables').work_projects;

// Get configurations by companyId and workProjectId
router.get(
  '/configs/:projectId',
  function*() {
    var projectId = this.params.projectId;
    var project = null;
    try {
      project = yield Projects.findOne({
        where: {
          id: projectId
        },
        raw: true
      });
    } catch (err) {
      console.error(err);
      this.throw(500);
    }

    if (project && permissions.has(this.req.user, project.companyId)) {
      try {
        this.body = yield Configs.findAll({
          where: {
            workProjectId: projectId
          },
          raw: true
        });
      } catch (err) {
        console.error(err);
        this.throw(500);
      }
    } else {
      this.throw(403);
    }
  }
);

app.use(router.routes());

module.exports = app;
