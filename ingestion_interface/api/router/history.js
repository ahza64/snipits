// Module
const koa = require('koa');
const router = require('koa-router')();
const moment = require('moment');
const _ = require('underscore');

// Collection
const Histories = require('dsp_shared/database/model/ingestion/tables').histories;
const Users = require('dsp_shared/database/model/ingestion/tables').users;
const Admins = require('dsp_shared/database/model/ingestion/tables').admins;

// App
const app = koa();

// Upload/Delete/Ingest history
router.post(
  '/history',
  function*() {
    var body = this.request.body;
    var email = body.email;
    var fileName = body.file;
    var action = body.action;

    // Check whether the user exists
    var user = yield Users.findOne({ where: { email: email }, raw: true });
    var userId = user.id;
    if (!userId) { this.throw(403); }

    var obj = {
      fileName: fileName,
      action: action,
      time: new Date(),
      userId: userId
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
    var time = h['histories.time'];
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
        include: [ Histories ],
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
      
      if (histories.length === 1 && !histories['histories.id']) {
        return this.body = {
          heatmapData: [],
          historiesData: {}
        };
      }

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