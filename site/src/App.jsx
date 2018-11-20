import React, { Component } from 'react';
import { HashRouter, Route, Switch } from 'react-router-dom';

import {

  Card,

} from '@blueprintjs/core';

import {Home} from './pages/Home';
import {FlowDemo} from './pages/FlowDemo';
import {NotFound} from './pages/NotFound';

import './App.scss';
import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/table/lib/css/table.css';


class App extends Component {
  render() {
    return (
      <div className="app">
        <div className="app-screen">
          <Card className="app-content" elevation="4">
            <HashRouter>
              <Switch>
                <Route path="/" exact component={Home} />
                <Route path="/flow-demo" exact component={FlowDemo} />
                <Route path="*" exact component={NotFound} />
              </Switch>
            </HashRouter>
          </Card>
        </div>
      </div>
    );
  }
}

export default App;
