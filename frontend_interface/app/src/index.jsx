// Modules
import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';

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
      <Route path='upload' component={ Upload }></Route>
      <Route path='admin' component={ Admin }></Route>
      <Route path='ingestion' component={ Ingestion }></Route>
    </Route>
  </Router>,
document.getElementById('app'));