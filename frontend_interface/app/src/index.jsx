// Modules
import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';

// Components
import App from './components/App.jsx';
import Main from './components/main/main.jsx';
import Login from './components/login/login.jsx';

// Router
ReactDOM.render(
  <Router history={ browserHistory }>
    <Route path='/' component={ App }>
      <IndexRoute component={ Login } />
      <Route path='main' component={ Main }></Route>
    </Route>
  </Router>,
document.getElementById('app'));