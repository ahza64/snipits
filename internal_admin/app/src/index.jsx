// Modules
import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';
import { isRouteAuthorized } from './components/auth/auth';

// Components
import App from './components/App.jsx';
import Login from './components/login/login.jsx';
import Create from './components/create/create.jsx';
import Ingest from './components/ingest/ingest.jsx';

// Router
ReactDOM.render(
  <Router history={ browserHistory }>
    <Route path='/' component={ App }>
      <IndexRoute component={ Login } />
      <Route onEnter={ isRouteAuthorized } path='create' component={ Create }></Route>
      <Route onEnter={ isRouteAuthorized } path='ingest' component={ Ingest }></Route>
    </Route>
  </Router>,
document.getElementById('app'));