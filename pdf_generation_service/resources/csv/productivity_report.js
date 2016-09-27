module.exports = {
  fields : [
    {
      label: 'Company',
      value: 'name',
      default: ''
    },
    {
      label: 'Role',
      value: 'role',
      default: ''
    },
    {
      label: 'Division',
      value: 'division',
      default: '/'
    },
    {
      label: 'Avg Hrs Worked',
      default: '0',
      value: function(row) {
        return row.avgHrs.toFixed(2);
      }
    },
    {
      label: 'Avg Trees Worked',
      default: '0',
      value: function(row) {
        return row.avgUnits.toFixed(2);
      }
    },
    {
      label: 'Max Hrs Worked',
      default: '0',
      value: function(row) {
        return row.maxHrs.toFixed(2);
      }
    },
    {
      label: 'Max Trees Worked',
      default: '0',
      value: function(row) {
        return row.maxUnits.toFixed(2);
      }
    },
    {
      label: 'Last Week Hrs Worked',
      default: '0',
      value: function(row) {
        return row.hrs.toFixed(2);
      }
    },
    {
      label: 'Last Week Trees Worked',
      default: '0',
      value: function(row) {
        return row.units.toFixed(2);
      }
    },
    {
      label: 'Not Ready',
      value: 'notready',
      default: '0'
    },
    {
      label: 'Left',
      value: 'piRemain',
      default: '/'
    },
    {
      label: 'Ready',
      value: 'tcRemain',
      default: '/'
    },
    {
      label: 'Total', 
      value: 'total',
      default: '0' 
    }
  ]
};