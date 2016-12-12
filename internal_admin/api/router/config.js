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
const Configs = require('dsp_shared/database/model/ingestion/tables').ingestion_configurations;

var isCorrectFileType = function*(fileType, workProjectId, configId) {
  var config = yield Configs.findOne({
    where: { fileType: fileType, workProjectId: workProjectId },
    raw: true
  });
  return (!config) || (config.id === configId);
}

// Create/update a configuration
router.post(
  '/config',
  function*() {
    if (permissions.has(this.req.user, null)) {
      var created = false;
      var body = this.request.body;
      try {
        var configId = body.id;
        if (yield isCorrectFileType(body.fileType, body.workProjectId, configId)) {
          if (configId) {
            // update configuration
            var config = yield Configs.find({ where: { id: configId } });
            this.body = yield config.updateAttributes({
              fileType: body.fileType,
              description: body.description,
              status: body.status
            });
          } else {
            // create a configuration
            this.body = yield Configs.create({
              fileType: body.fileType,
              description: body.description,
              status: body.status? body.status : ACTIVE,
              companyId: body.companyId,
              workProjectId: body.workProjectId
            });
          }
          created = true;
        }
      } catch (e) {
        console.error(e);
        this.throw(500);
      }

      if(!created) {
        console.error('Ingestion configuration with fileType', body.name, 'already exists');
        this.throw(409);
      }
    } else {
      this.throw(403);
    }
  }
);

// Delete configuration by id
router.delete(
  '/config/:id',
  function*() {
    var configId = this.params.id;
    if (permissions.has(this.req.user, null)) {
      try {
        this.body = yield Configs.destroy({ where: { id: configId } });
      } catch (e) {
        console.error(e);
        this.throw(500);
      }
    } else {
      this.throw(403);
    }
  }
);

// Get configurations by workProjectId
router.get(
  '/configs/:projectId',
  function*() {
    var projectId = this.params.projectId;

    if (projectId && permissions.has(this.req.user, null)) {
      var configs = [];
      try {
        configs = yield Configs.findAll({
          where: { workProjectId: projectId },
          raw: true
        });
      } catch (err) {
        console.error(err);
      }

      this.body = configs;
    } else {
      this.throw(403);
    }
  }
);

app.use(router.routes());

module.exports = app;
