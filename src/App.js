// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import ActiveWorks from './pages/ActiveWorks';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/obras-ativas" component={ActiveWorks} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/" exact>
          <div className="flex items-center justify-center h-screen">
            <h1 className="text-4xl">Bem-vindo ao Sistema de Gestão de Obras</h1>
          </div>
        </Route>
      </Switch>
    </Router>
  );
}

export default App;// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import ActiveWorks from './pages/ActiveWorks';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/obras-ativas" component={ActiveWorks} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/" exact>
          <div className="flex items-center justify-center h-screen">
            <h1 className="text-4xl">Bem-vindo ao Sistema de Gestão de Obras</h1>
          </div>
        </Route>
      </Switch>
    </Router>
  );
}

export default App;