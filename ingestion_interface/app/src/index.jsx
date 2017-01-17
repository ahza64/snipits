// Modules
const urlPrefix = require('dsp_shared/conf.d/config.json').mooncake.url_prefix;
import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';
import { isRouteAuthorized } from './components/auth/auth';

// Components
import App from './components/App.jsx';
import Upload from './components/upload/upload.jsx';
import Login from './components/login/login.jsx';
import FindMain from './components/find/findMain.jsx';

// Router
ReactDOM.render(
  <Router history={ browserHistory }>
    <Route path={ urlPrefix } component={ App }>
      <IndexRoute component={ Login } />
      <Route onEnter={ isRouteAuthorized } path='upload/' component={ Upload }></Route>
      <Route onEnter={ isRouteAuthorized } path='find/' component={ FindMain }></Route>
    </Route>
  </Router>,
document.getElementById('app'));
