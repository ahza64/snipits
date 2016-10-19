// Modules
import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';
import { isRouteAuthorized } from './components/auth/auth';

// Components
import App from './components/App.jsx';
import Upload from './components/upload/upload.jsx';
import Login from './components/login/login.jsx';
import Admin from './components/admin/admin.jsx';
import Ingestion from './components/ingestion/ingestion.jsx';

// Router
ReactDOM.render(
  <Router history={ browserHistory }>
    <Route path='/' component={ App }>
      <IndexRoute component={ Login } />
      <Route onEnter={ isRouteAuthorized } path='upload' component={ Upload }></Route>
      <Route onEnter={ isRouteAuthorized } path='admin' component={ Admin }></Route>
      <Route onEnter={ isRouteAuthorized } path='ingest' component={ Ingestion }></Route>
    </Route>
  </Router>,
document.getElementById('app'));