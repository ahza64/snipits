const WEEKS = 53;
const WEEKDAYS = 7;

var genWeeks = () => {
  var dates = [];

  for (var i = 1; i <= WEEKS; i++) {
    dates.push(i);
  }

  return dates;
};

var genWeekdays = () => {
  return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
};

// fake data which can be used later for set up the data model
var genMockUpData = () => {
  var data = [];

  for (var x = 0; x < WEEKS; x++) {
    var slot = [];
    slot.push(x);

    for (var y = 0; y < WEEKDAYS; y++) {
      slot.push(y);
      slot.push(Math.ceil(Math.random() * 10));
      data.push(slot);
      slot = [x];
    }
  }
  return data;
};

module.exports = {
  genWeeks: genWeeks,
  genWeekdays: genWeekdays,
  genMockUpData: genMockUpData,
};