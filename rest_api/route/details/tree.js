const Tree = require('dsp_shared/database/model/tree');
const Cufs = require('dsp_shared/database/model/cufs');
const Assets = require('dsp_shared/database/model/assets');

const koa = require('koa');
const router = require('koa-router')();

const app = koa();

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
  1: 'left',
  2: 'allgood',
  3: 'notready',
  4: 'ready',
  5: 'worked',
};

const priorityLib = {
  1: 'routine',
  2: 'accelerate',
  3: 'immediate',
  4: 'routine(no trim)'
};

const envLib = {
  1: 'Riparian',
  2: 'VELB',
  3: 'Raptor Nest',
  4: 'Other'
};

function pad(number, length, defaultValue) {
  let str = '';
  if (number || (!defaultValue)) {
    str = ''.concat(number || 0);
    while (str.length < length) {
      str = '0'.concat(str);
    }
  } else {
    str = defaultValue;
  }
  return str;
}

function getWorkType(tree) {
  const species = tree.species || null;
  return [
    null, "Tallow, Chinese", "Sycamore", "Pistache", "Silk Oak", "Casuarina",
    "Eucalyptus", "Canary Island Pine", "Cork Oak", "Pear", "Redwood, Coast",
    "Mulberry", "Elm, American", "Monterey Pine", "Almond", "Palm", "Atlas Cedar",
    "Maple", "Elm", "Chinese Elm", "Valley Oak", "Italian Cypress", "Privet",
    "unknown", "Pepper Tree", "Valley oak", "Hackberry", "Pine", "Zelkova",
    "English Walnut", "Walnut", "Plum", "Albizzia", "Liq Ambar (Sw Gum)", "Ash",
    "Spruce", "Crape Myrtle", "Mayten", "Bottlebrush", "Red Oak, Northern",
    "Locust, Black", "Gray Pine", "Ailanthus", "Other", "Poplar", "Fruit Tree",
    "Aleppo Pine", "Fir, True", "Birch", "Modesto Ash", "Alder", "Camphor",
    "Cypress", "Koelreuteria", "Hawthorn", "Olive", "Tulip Tree", "Black Walnut",
    "Cottonwood, Black", "Pecan", "Willow", "Brush", "Raywood Ash", "Coastal live oak",
    "Ponderosa Pine", "Blue oak", "Live Oak", "Buckeye", "Mimosa", "Cherry",
    "Redbud", "Oleander", "Podocarpus", "Deodara Cedar", "Eugenia", "Blackwood Acacia",
    "Cottonwood, Freemont", "Bay", "Black Oak", "White Fir", "Cedar", "Douglas Fir",
    "Sugar Pine", "Apple", "Unknown", "Oak", "Elderberry", "Blue Oak", "Jeffery Pine",
    "Blue Gum", "Canyon Live Oak", "Madrone", "Lodgepole Pine", "Bigleaf Maple",
    "Tan Oak", "Oregon White Oak", "Chinquapin", "Knobcone Pine", "Catalpa",
    "Interior Live Oak", "Monterey Cypress", "Oracle Oak", "Coast Live Oak",
    "Italian Stone Pine", "Sequoia, Giant", "Box", "Myrtle, Pacific Wax", "Holly Oak",
    "Arundo", "Fig", "Bamboo", "Ginkgo", "Magnolia", "Liq Ambar", "Silver Maple",
    "Myoporum", "Juniper", "Lombardy Poplar", "Carob", "Ceanothus", "Toyon",
    "Chestnut", "Grand Fir", "Pittosporum", "Red Gum", "Loquat", "Century Plant",
    "Vine", "Laurel, Grecian", "Yucca", "Red Fir", "Chinaberry", "Silver Dollar Gum",
    "Avocado", "Pomegranate", "Pin Oak", "Red Ironbark", "Australian Willow",
    "Evergreen Ash", "Athel", "Weeping Willow", "Jacaranda", "English Oak",
    "Melaleuca", "Linden", "Honey Locust", "Salt Cedar", "Coral", "Norfolk Island Pine",
    "Acacia"
  ].indexOf(species) + 123;
}

function getAssetType(tree) {
  const height = tree.height || null;
  const assets = ["Pole", "Transformer", "Fuse", "Line", "Guidebob", "Crossarm", "Insulators"];
  const max = [0, 30, 50, 70, 100, 150, 10000];
  let asset = null;
  for (let i = 1; i < max.length; i++) {
    if (height < max[i]) {
      asset = assets[i];
      break;
    }
  }
  return asset;
}

/**
 * Check whether the tree is on tablet or not
 * @param  {String}  tree_id Tree string id
 * @return {Boolean}         Ture or false
 */
function *isOnTablet(treeId) {
  const treesOnTablet = yield Cufs.find({ 'workorder.tasks': treeId });
  return treesOnTablet.length !== 0;
}

function *getTreeStatusDisplay(tree) {
  const treeId = tree._id;
  const onTablet = yield isOnTablet(treeId);
  let statusDisplay = '';
  if (onTablet) {
    statusDisplay = 'On Device';
  } else {
    const position = statusCodePositionReverseLib.indexOf('status');
    if (position >= 0) {
      const digit = tree.status[position];
      statusDisplay = statusCodeLib[digit];
    }
    statusDisplay = statusDisplay === 'allgood' ? 'no trim' : statusDisplay;
  }
  return statusDisplay;
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
    if (Object.prototype.hasOwnProperty.call(envLib, digit)) {
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
  for (let i = 0; i < conf.length; i++) {
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
          label: label,
          data: image.data,
          created: image.created,
          user: user
        });
      }
    }
  }
  return images;
}

router.get('/tree/:id', function *assign(next) {
  const id = this.params.id;

  try {
    const tree = yield Tree.findOne({ _id: id });
    let details = null;
    if (tree) {
      details = JSON.parse(JSON.stringify(tree));
      let geoAddress = 'N/A';
      if (tree.streetNumber && tree.streetName) {
        geoAddress = `${tree.streetNumber} ${tree.streetName}`;
      }
      details.geo_address = geoAddress;
      details.ois = pad(tree.access_code_value, 7);
      details.work_type = getWorkType(tree);
      details.asset_type = getAssetType(tree);
      details.damage_type = pad(tree.trim_code, 3, 'N/A');
      details.ssd = tree.span_name;
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
  } catch (e) {
    console.error('Error getting tree details:', e.message);
  }
  yield next;
});

app.use(router.routes());

module.exports = app;
