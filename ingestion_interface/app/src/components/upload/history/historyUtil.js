const WEEKS = 53;

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

module.exports = {
  genWeeks: genWeeks,
  genWeekdays: genWeekdays,
};