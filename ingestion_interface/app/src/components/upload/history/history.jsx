// Modules
import React from 'react';
import * as request from 'superagent';
const moment = require('moment');
const ReactHighcharts = require('react-highcharts');
require('highcharts-more')(ReactHighcharts.Highcharts);
require('highcharts/modules/heatmap')(ReactHighcharts.Highcharts);
const historyUtil = require('./historyUtil');

// Components
import authRedux from '../../../reduxes/auth';
import { fileHistoryUrl } from '../../../config';
import UploadLib from '../uploadLib';

// Styles
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
const heatmapStyle = {
    minWidth: '500px',
    maxWidth: '1000px',
    height: '200px'
};

const weekDayLib = {
  Mon: '1',
  Tue: '2',
  Wed: '3',
  Thu: '4',
  Fri: '5',
  Sat: '6',
  Sun: '7'
};

export default class History extends UploadLib {
  constructor() {
    super();

    var self = this;
    this.hmConfig = {
      chart: {
        type: 'heatmap',
        marginTop: 60,
        marginBottom: 80,
        plotBorderWidth: 1
      },

      title: {
        text: 'Ingestion Heatmap'
      },

      xAxis: {
        categories: historyUtil.genWeeks()
      },

      yAxis: {
        categories: historyUtil.genWeekdays(),
        title: null
      },

      colorAxis: {
        min: 0,
        minColor: '#F8F8F8',
        maxColor: '#2DD48B'
      },

      legend: {
        align: 'right',
        layout: 'vertical',
        margin: 0,
        verticalAlign: 'top',
        y: 25,
        symbolHeight: 280
      },

      tooltip: {
        formatter: function () {
          var week = this.series.xAxis.categories[this.point.x];
          var weekday = weekDayLib[this.series.yAxis.categories[this.point.y]];
          var key = week + ' ' + weekday;
          var history = self.state.histories;
          var str = '';

          if (history[key]) {
            history[key].forEach(record => {
              var name = record.name;
              var action = record['ingestion_histories.action'];
              var fileName = record['ingestion_histories.customerFileName'];
              var time = record['ingestion_histories.createdAt'];

              str += name + ' ' + action + ' ' + fileName + ' on ' + moment(time).format('MMM DD hh:mm:ss') + '<br>';
            });

            return str;
          } else {
            return 'no history';
          }
        }
      },

      series: [
        {
          name: 'Ingestion Heatmap',
          borderWidth: 0,
          data: []
        }
      ]
    };

    this.state = {
      heatmap: this.hmConfig,
      histories: {},
    };
  }

  componentWillMount() {
    var heatmapData = this.props.heatmap;
    var historiesData = this.props.histories;

    this.hmConfig.series[0].data = heatmapData;
    this.setState({
      heatmap: this.hmConfig,
      histories: historiesData
    });
  }

  componentWillReceiveProps(nextProps) {
    var heatmapData = nextProps.heatmap;
    var historiesData = nextProps.histories;

    this.hmConfig.series[0].data = heatmapData;
    this.setState({
      heatmap: this.hmConfig,
      histories: historiesData
    });
  }

  render() {
    return (
      <div>
        <Col xs={0} sm={0} md={1} lg={1} ></Col>
        <Col xs={12} sm={12} md={10} lg={10} >
          <Row>
            <ReactHighcharts
              style={ heatmapStyle }
              config={ this.state.heatmap }
            >
            </ReactHighcharts>
          </Row>
        </Col>
        <Col xs={0} sm={0} md={1} lg={1} ></Col>
      </div>
    );
  }
}