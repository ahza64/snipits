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
const Watchers = require('dsp_shared/database/model/ingestion/tables').ingestion_watchers;

var isCorrectFileType = function*(fileType, workProjectId, configId) {
  var config = yield Configs.findOne({
    where: { fileType: fileType, workProjectId: workProjectId },
    raw: true
  });
  return (!config) || (config.id === configId);
};

var updateWatchers = function*(config, emails) {
  if (config && emails) {
    var formated = emails.map(email => {
      return email.toLowerCase();
    });
    var watchers = yield Watchers.findAll({
      where: { ingestionConfigurationId: config.id },
      raw: true
    });
    if (watchers) {
      for (var i=0; i<watchers.length; i++) {
        var email = watchers[i].email.toLowerCase();
        var index = formated.indexOf(email);
        if (index < 0) {
          yield Watchers.destroy({ where: { id: watchers[i].id } });
        } else {
          formated.splice(index, 1);
        }
      }
    }
    for (var i=0; i<formated.length; i++) {
      yield Watchers.create({
        companyId: config.companyId,
        ingestionConfigurationId: config.id,
        email: formated[i]
      });
    }
  }
};

// Create/update a configuration
router.post(
  '/config',
  function*() {
    if (permissions.has(this.req.user, null)) {
      var saved = false;
      var body = this.request.body;
      try {
        var configId = body.id;
        if (yield isCorrectFileType(body.fileType, body.workProjectId, configId)) {
          var config;
          if (configId) {
            // update configuration
            config = yield Configs.find({ where: { id: configId } });
            config = yield config.updateAttributes({
              fileType: body.fileType,
              description: body.description,
              status: body.status
            });
          } else {
            // create a configuration
            config = yield Configs.create({
              fileType: body.fileType,
              description: body.description,
              status: body.status? body.status : ACTIVE,
              companyId: body.companyId,
              workProjectId: body.workProjectId
            });
          }
          yield updateWatchers(config, body.watchers);
          this.body = config;
          saved = true;
        }
      } catch (e) {
        console.error(e);
        this.throw(500);
      }

      if(!saved) {
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
