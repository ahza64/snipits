// Modules
const urlPrefix = require('dsp_shared/conf.d/config.json').admin.url_prefix;
import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';
import { isRouteAuthorized } from './components/auth/auth';

// Components
import App from './components/App.jsx';
import Login from './components/login/login.jsx';
import Companies from './components/companies/companies.jsx';
import Create from './components/create/create.jsx';
import Ingest from './components/ingest/ingest.jsx';
import Users from './components/users/users.jsx';


// Router
ReactDOM.render(
  <Router history={ browserHistory }>
    <Route path={ urlPrefix } component={ App }>
      <IndexRoute component={ Login } />
      <Route onEnter={ isRouteAuthorized } path='companies/' component={ Companies }></Route>
      <Route onEnter={ isRouteAuthorized } path='create/' component={ Create }></Route>
      <Route onEnter={ isRouteAuthorized } path='ingest/' component={ Ingest }></Route>
      <Route onEnter={ isRouteAuthorized } path='users/' component={ Users }></Route>
    </Route>
  </Router>,
document.getElementById('app'));
