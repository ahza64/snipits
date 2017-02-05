// Modules
import React from 'react';
import { browserHistory } from 'react-router';
import request from '../../services/request';
import authRedux from '../../reduxes/auth';
import projectRedux from '../../reduxes/project';
// Components
import Schema from './schema';

// Styles
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';

export default class SchemasLayout extends React.Component {
  constructor() {
    super();

    this.state = {
      schemaList : []
    }

    this.componentWillMount = this.componentWillMount.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.fetchSchemas = this.fetchSchemas.bind(this);
    this.setSchemas = this.setSchemas.bind(this);
    this.fetchSchemas( res =>{
      console.log(res.body);
      this.setSchemas(res.body);
    });
  }

  componentWillMount(){
    console.log(this.state.schemaList);
  }

  componentDidMount(){
    this.fetchSchemas( res =>{
      this.setSchemas(res.body);
    });
  }

  setSchemas(list){
    this.setState({
      schemaList : list
    })
  }

  fetchSchemas(callback){
    console.log('========fetchSchemas========= proj:', projectRedux.getState());
    request
    .get('http://localhost:3335/schemas/' + projectRedux.getState())
    .withCredentials()
    .end(function (err, res) {
      if (err) {
        console.error(err);
      } else {
        callback(res)
      }
      return res;
    })
  }

  render() {
    return (
      <div>Here are your schemas
        {
          this.state.schemaList.map((scheme,idx)=>{
            return <label key={idx} value={ scheme.id } ><button></button></label>
          })
        }
        <button className='btn' ref='refreshBtn' >Refresh</button>
        <button className='btn' id='addSchema' >Add Schema</button>
      </div>
    );
  }
}
