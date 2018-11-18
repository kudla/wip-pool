import React, { Component } from 'react';
import { createBrowserHistory } from 'history';
import { HashRouter, Route, Switch } from 'react-router-dom';

import {

  Card,

} from '@blueprintjs/core';

import {Home} from './pages/Home';
import {NotFound} from './pages/NotFound';

import './App.css';
import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/table/lib/css/table.css';


const history = createBrowserHistory();



class App extends Component {
  render() {
    return (
      <div className="app">
        <div className="app-screen">
          <Card className="app-content" elevation="4">
            <HashRouter history={history}>
              <Switch>
                <Route path="/" component={Home} />
                <Route path='*' exact={true} component={NotFound} />
              </Switch>
            </HashRouter>
          </Card>
        </div>
      </div>
    );
  }
}

export default App;
