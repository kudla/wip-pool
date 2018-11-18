import React, { Component } from 'react';

import {
  FormGroup,
  Callout,
  Intent
} from '@blueprintjs/core';

export class NotFound extends Component {
  render() {
    return (
          <div className="not-found">
              <FormGroup className="banner" />
              <FormGroup>
                  <Callout intent={Intent.DANGER}>
                    <p>Sorry.</p>
                    <p>This page can't be found.</p>
                  </Callout>
              </FormGroup>
          </div>
    );
  }
}

export default NotFound;
