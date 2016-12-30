// Modules
const koa = require('koa');
const router = require('koa-router')();
const permissions = require('./permissions');
const s3 = require('dsp_shared/aws/s3');
const config = require('dsp_shared/conf.d/config.json').mooncake;
const s3Prefix = config.env + '.';

// App
const app = koa();

// Collection
const sequelize = require('dsp_shared/database/model/ingestion/tables').sequelize;
const Ingestions = require('dsp_shared/database/model/ingestion/tables').ingestion_files;
const Configs = require('dsp_shared/database/model/ingestion/tables').ingestion_configurations;
const Projects = require('dsp_shared/database/model/ingestion/tables').work_projects;
const Companies = require('dsp_shared/database/model/ingestion/tables').companies;
const Histories = require('dsp_shared/database/model/ingestion/tables').ingestion_histories;

// Create a file record for ingestions
router.post(
  '/ingestions',
  function*() {
    var body = this.request.body;

    var record = {
      customerFileName: body.customerFileName,
      s3FileName: body.s3FileName,
      ingested: false,
      companyId: body.companyId,
      ingestionConfigurationId: body.ingestionConfigurationId
    };

    try {
      var ingestion = yield Ingestions.create(record);
      this.body = ingestion;
    } catch(e) {
      console.error(e);
      this.throw(500);
    }

  }
);

// Set the description for the ingestion
router.put(
  '/ingestions',
  function*() {
    var body = this.request.body;
    var description = body.description;
    var fileId = body.fileId;
    if (fileId) {
      try {
        var ingestion = yield Ingestions.find({ where: { id: fileId } });
        ingestion = yield ingestion.updateAttributes({
          description: description
        });
      } catch(e) {
        console.error(e);
        this.throw(500);
      }
    } else {
      console.error('fileId not found');
      this.throw(500);
    }
    this.throw(200);
  }
);

var createNewS3FileName = function(ingestion, company, newProject, newConfig) {
  var index = ingestion.s3FileName.lastIndexOf('_');
  if(index >= 0) {
    var timestamp = ingestion.s3FileName.substring(index+1);
    return company.name.toLowerCase() + '_' +
      newProject.name.toLowerCase() + '_' +
      newConfig.fileType.toLowerCase() + '_' + timestamp;
  } else {
    throw "Incorrect ingestion s3FileName";
  }
}

var addToHistory = function*(file, user, action) {
  var obj = {
    action: action,
    customerFileName: file.customerFileName,
    userName: user.name,
    userId: user.id,
    companyId: file.companyId,
    ingestionFileId: file.id,
    ingestionConfigurationId: file.ingestionConfigurationId
  };
  return yield Histories.create(obj);
};

// Change configutation for the ingestion
router.put(
  '/ingestions/config',
  function*() {
    var body = this.request.body;
    var fileId = body.fileId;
    var configId = body.configId;

    if (fileId && configId) {
      var ingestion = null;
      var ingestionWithSameName = null;
      try {
        ingestion = yield Ingestions.find({ where: { id: fileId } });
        ingestionWithSameName = yield Ingestions.find({
          where: {
            customerFileName: ingestion.customerFileName,
            ingestionConfigurationId: configId
          }
        });
      } catch(e) {
        console.error(e);
        this.throw(500);
      }

      if (ingestionWithSameName) {
        this.throw(409);
      }

      if ((ingestion.ingestionConfigurationId !== configId) && permissions.has(this.req.user, ingestion.companyId)) {
        try {
          var config = yield Configs.find({ where: { id: configId } });
          var project = yield Projects.find({ where: { id: config.workProjectId } });
          var company = yield Companies.find({ where: { id: ingestion.companyId } });

          var originalFileName = ingestion.s3FileName;
          var targetFileName = createNewS3FileName(ingestion, company, project, config);
          var bucket = s3Prefix + company.name.toLowerCase() + '.ftp';

          if (originalFileName !== targetFileName) {
            yield s3.copy(bucket, originalFileName, targetFileName);
            ingestion = yield ingestion.updateAttributes({
              ingestionConfigurationId: configId,
              s3FileName: targetFileName
            });
            yield s3.delete(bucket, [originalFileName]);
            yield addToHistory(ingestion, this.req.user, 'move');
            this.body = ingestion
          }

        } catch(e) {
          console.error(e);
          this.throw(500);
        }
      } else {
        this.throw(403);
      }
    } else {
      console.error('File Id Not Found');
      this.throw(500);
    }
  }
);

// Get the total number of the record
router.get(
  '/ingestions/total/:companyId',
  function*() {
    var companyId = this.params.companyId;

    try {
      var total = yield Ingestions.count({
        where: { companyId: companyId }
      });
    } catch(e) {
      console.error(e);
      this.throw(500);
    }

    this.body = total;
  }
);

// Get all ingestion record
router.get(
  '/ingestions/all/:companyId/:offset',
  function*() {
    var companyId = this.params.companyId;
    var offset = this.params.offset;

    try {
      var ingestions = yield Ingestions.findAll({
        limit: 5,
        offset: offset,
        where: { companyId: companyId },
        include: [{
          model: Configs,
          attributes: [['workProjectId','projectId']],
          required: false
        }],
        order: [['createdAt', 'desc']],
        raw: true
      });
    } catch(e) {
      console.error(e);
      this.throw(500);
    }

    this.body = ingestions;
  }
);

// Get the ingestion record
router.get(
  '/ingestions/:fileName/:companyId',
  function*() {
    var fileName = this.params.fileName;
    var companyId = this.params.companyId;

    try {
      var ingestion = yield Ingestions.findOne({
        where: {
          customerFileName: fileName,
          companyId: companyId
        },
        raw: true
      });
    } catch(e) {
      console.error(e);
      this.throw(500);
    }

    this.body = ingestion;
  }
);

// Search the ingestion record
router.get(
  '/searchingestions/:companyId/:token(.*)',
  function*() {
    var companyId = this.params.companyId;
    var token = this.params.token;
    try {
      var ingestions = yield Ingestions.findAll({
        where: {
          companyId: companyId,
          customerFileName: {
            $like: '%' + token + '%'
          }
        },
        include: [{
          model: Configs,
          attributes: [['workProjectId','projectId']],
          required: false
        }],
        raw: true
      });

      this.body = ingestions;
    } catch(e) {
      console.error(e);
      this.throw(500);
    }
  }
);

app.use(router.routes());

module.exports = app;
