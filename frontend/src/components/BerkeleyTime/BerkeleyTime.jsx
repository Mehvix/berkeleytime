import React from 'react';
import {
  Route,
  Switch,
  Redirect,
} from 'react-router-dom';

import Navigation from '../Navigation/Navigation';
import Footer from '../Footer/Footer';

import appRoutes from '../../routes/app.js';

import ReactGA from 'react-ga';

const gaTrackingID = 'UA-35316609-1'
ReactGA.initialize(gaTrackingID);

const logPageView = () => {
    ReactGA.set({ page: window.location.pathname});
    ReactGA.pageview(window.location.pathname);
    return null;
};

function BerkeleyTime({ props }) {
  return (
    <div className="bt">
      <div id="main-panel" className="main-panel">
        <Navigation {...props} />
          <Route path="/" component={logPageView} />
          <Switch>
            {
              appRoutes.map((prop, key) => {
                if (prop.redirect) {
                  return (
                    <Redirect exact={prop.exact} from={prop.path} to={prop.to} key={key} />
                  );
                } else {
                  return (
                    <Route exact={prop.exact} path={prop.path} component={prop.component} key={key} />
                  )
                }
              })
            }
          </Switch>
        <Footer />
      </div>
    </div>
  );
}

export default BerkeleyTime;