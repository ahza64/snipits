// Modules
import React from 'react';
const ReactHighcharts = require('react-highcharts');
require('highcharts-more')(ReactHighcharts.Highcharts);
require('highcharts/modules/heatmap')(ReactHighcharts.Highcharts);
const historyUtil = require('./historyUtil');

// Components
import authRedux from '../../../reduxes/auth';
import UploadLib from '../uploadLib';

// Styles
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
const heatmapStyle = {
    minWidth: '500px',
    maxWidth: '1000px',
    height: '200px'
};

export default class History extends React.Component {
  constructor() {
    super();

    this.state = {
      config: {
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
          minColor: '#FFFFFF',
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
            return '<b>' + this.series.xAxis.categories[this.point.x] + '</b> action <br><b>' +
            this.point.value + '</b> items on <br><b>' + this.series.yAxis.categories[this.point.y] + '</b>';
          }
        },

        series: [
          {
            name: 'Ingestion Heatmap',
            borderWidth: 0,
            data: historyUtil.genMockUpData(),
            /*
            dataLabels: {
              enabled: true,
              color: 'black',
              style: {
                textShadow: 'none'
              }
            }
            */
          }
        ]
      }
    };
  }

  render() {
    return (
      <div>
        <Col xs={0} sm={0} md={1} lg={1} ></Col>
        <Col xs={12} sm={12} md={10} lg={10} >
          <Row>
            <ReactHighcharts style={ heatmapStyle } config={ this.state.config }></ReactHighcharts>
          </Row>
        </Col>
        <Col xs={0} sm={0} md={1} lg={1} ></Col>
      </div>
    );
  }
}