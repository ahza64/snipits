const Tree = require('dsp_shared/database/model/tree');
const Cufs = require('dsp_shared/database/model/cufs');
const Assets = require('dsp_shared/database/model/assets');

var koa = require('koa');
var app = koa();
var router = require('koa-router')();

const statusCodePositionReverseLib = [
  'status',
  'source',
  'priority',
  'vc_codes',
  'assigned',
  'dog',
  'irate_customer',
  'notify_customer',
  'ntw_needed',
  'access_issue',
  'refused',
  'vehicle_type',
  'environmental'
];

const statusCodeLib = {
  '1': 'left',
  '2': 'allgood',
  '3': 'notready',
  '4': 'ready',
  '5': 'worked',
};

const priorityLib = {
  '1': 'routine',
  '2': 'accelerate',
  '3': 'immediate',
  '4': 'routine(no trim)'
};

const envLib = {
  '1': 'Riparian',
  '2': 'VELB',
  '3': 'Raptor Nest',
  '4': 'Other'
};

router.get('/tree/:id', function *assign(next) {
  const id = this.params.id;

  try {
    let tree = yield Tree.findOne({_id: id});
    let details = null;
    if (tree) {
      details = JSON.parse(JSON.stringify(tree));
      let geoAddress = 'N/A';
      if (tree.streetNumber && tree.streetName) {
        geoAddress = `${tree.streetNumber} ${tree.streetName}`;
      }
      details.geo_address = geoAddress;
      details.status_display = yield getTreeStatusDisplay(tree);
      details.priority = getPriority(tree);
      details.trim = getFeetFromInteger(tree.clearance, 'FT');
      details.height = getFeetFromInteger(tree.height, 'FT');
      details.diameter = getFeetFromInteger(tree.dbh, 'In');
      details.environment = getEnvironment(tree);

      details.images = yield getImages([
        { id: tree.image, label: 'Inspected', userId: tree.pi_user_id },
        { id: tree.tc_image, label: 'Worked', userId: tree.tc_user_id }
      ]);
      details.ntwImage = yield getImages([
        { id: tree.ntw_image, label: 'Ntw', userId: null }
      ]);
    }
    this.body = details;
  } catch(e) {
    console.error('Error getting tree details:', e.message);
  }
  yield next;
});

function *getTreeStatusDisplay(tree) {
  const treeId = tree._id;
  const onTablet = yield isOnTablet(treeId);
  let statusDisplay = '';
  if (onTablet) {
    statusDisplay = 'On Device';
  } else {
    //status = TreeUtil.getTreeStatus(tree_obj);
    const position = statusCodePositionReverseLib.indexOf('status');
    if (position >= 0) {
      const digit = tree.status[position];
      statusDisplay = statusCodeLib[digit]
    }
    statusDisplay = statusDisplay === 'allgood' ? 'no trim' : statusDisplay;
  }
  return statusDisplay;
}

/**
 * Check whether the tree is on tablet or not
 * @param  {String}  tree_id Tree string id
 * @return {Boolean}         Ture or false
 */
function *isOnTablet(treeId) {
  const treesOnTablet = yield Cufs.find({'workorder.tasks': treeId});
  return treesOnTablet.length !== 0;
}

function getPriority(tree) {
  let priority = '';
  const position = statusCodePositionReverseLib.indexOf('priority');
  if (position >= 0) {
    priority = priorityLib[tree.status[position]];
  }
  return priority;
}

function getEnvironment(tree) {
  let env = '';
  const position = statusCodePositionReverseLib.indexOf('environmental');
  if (position >= 0) {
    const digit = tree.status[position];
    if (envLib.hasOwnProperty(digit)) {
      env = envLib[digit];
    }
  }
  return env;
}

/**
 * Get the data concatenated with feet like
 * 30FT and if the number is not available, just show
 * N/A
 * @param {Integer} number
 * @return {String} The number with FT
 */
function getFeetFromInteger(number, unit) {
  let res = 'N/A';
  if (number) {
    res = `${Math.round(number)} ${unit}`;
  }
  return res;
}

function *getImages(conf) {
  const images = [];
  for(let i = 0; i < conf.length; i++) {
    const id = conf[i].id;
    const label = conf[i].label;
    if (id) {
      const image = yield Assets.findOne({ _id: id });
      if (image) {
        let user = null;
        if (conf[i].userId) {
          user = yield Cufs.findOne({ _id: conf[i].userId });
          if (user) {
            user = {
              _id: user._id,
              phone_number: user.phone_number,
              name: user.name,
              photo_created: image.created,
            };
          }
        }
        images.push({
          id: id,
          label : label,
          data : image.data,
          created: image.created,
          user : user
        });
      }
    }
  }
  return images;
}

app.use(router.routes());

module.exports = app;
