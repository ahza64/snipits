// Module
const koa = require('koa');
const router = require('koa-router')();
const moment = require('moment');
const _ = require('underscore');
const notifications = require('./notifications');

// Collection
const Histories = require('dsp_shared/database/model/ingestion/tables').ingestion_histories;
const Users = require('dsp_shared/database/model/ingestion/tables').users;
const Ingestions = require('dsp_shared/database/model/ingestion/tables').ingestion_files;
const Admins = require('dsp_shared/database/model/ingestion/tables').dispatchr_admins;

// App
const app = koa();

// Upload/Delete/Ingest history
router.post(
  '/history',
  function*() {
    var body = this.request.body;
    var email = body.email;
    var action = body.action;

    // Check whether the user exists
    try {
      var user = yield Users.findOne({ where: { email: email }, raw: true });
    } catch(e) {
      console.error(e);
      this.throw(500);
    }
    var userId = user.id;
    if (!userId) { this.throw(403); }

    // Check whether the ingestion exists
    var ingestion = yield Ingestions.findOne({ where: { id: body.ingestionFileId }, raw: true });
    if (!ingestion.id) { this.throw(403); }

    yield notifications.send(this.req.user, ingestion, action);

    var obj = {
      action: action,
      userName: user.name,
      userId: user.id,
      companyId: ingestion.companyId,
      ingestionFileId: ingestion.id,
      ingestionConfigurationId: ingestion.ingestionConfigurationId
    };

    try {
      yield Histories.create(obj);
    } catch (e) {
      console.error(e);
      this.throw(500);
    }

    this.throw(200);
  }
);

var historyMassage = (histories) => {
  const WEEKS = 53;
  const WEEKDAYS = 7;

  // Mock up data
  var heatmapData = [];
  for (var x = 0; x < WEEKS; x++) {
    var slot = [];
    slot.push(x);

    for (var y = 0; y < WEEKDAYS; y++) {
      slot.push(y);
      slot.push(0);
      heatmapData.push(slot);
      slot = [x];
    }
  }

  histories.forEach(h => {
    var time = h['ingestion_histories.createdAt'];
    if (time) {
      h.timeKey = moment(time).format('ww e');
    }
  });

  histories = _.groupBy(histories, 'timeKey');
  for (var key in histories) {
    if (histories.hasOwnProperty(key) && key !== 'undefined') {
      var temp = key.split(' ').map(x => parseInt(x));
      var weekNum = temp[0];
      var weekDay = temp[1] - 1;
      var idx = (weekNum - 1) * 7 + weekDay;
      heatmapData[idx][2] = histories[key].length;
    }
  }

  return {
    heatmapData: heatmapData,
    historiesData: histories
  };
};

// Get histories
router.get(
  '/history/:companyId',
  function*() {
    var companyId = this.params.companyId;

    try {
      var histories = yield Users.findAll({
        where: { companyId: companyId },
        include: [ { model: Histories, include: [Ingestions] }],
        raw: true
      });

      histories = [
        ...histories,
        ...yield Admins.findAll({
          where: { companyId: companyId },
          include: [ Histories ],
          raw: true
        })
      ];

      if (histories.length === 1 && !histories['ingestion_histories.id']) {
        return this.body = {
          heatmapData: [],
          historiesData: {}
        };
      }

      //console.log(histories);
      histories = historyMassage(histories);
    } catch(e) {
      console.error(e);
      this.throw(500);
    }

    this.body = histories;
  }
);

app.use(router.routes());

module.exports = app;
