import React from 'react';
import classNames from 'classnames';
import {compose, withStateHandlers, setDisplayName} from 'recompose';
import {Spinner, Intent, Callout, Button} from '@blueprintjs/core';

function WipRender({wip, setState, completeConstruction}) {
    const {
        doneOrder,
        constructionOrder,
        progress
    } = wip;

    const clasName = classNames(
        'wps-wip',
        {
            'wps-wip__done': doneOrder !== undefined
        }
    );

    return (

        <div className={clasName} onClick={() => completeConstruction(constructionOrder)}>
                <div className="wps-wip_progress" style={{height: progress}}></div>
                <span className="wps-wip_id">#{constructionOrder}</span>
        </div>
    );
}

export const Wip = compose(
    setDisplayName('Wip'),
    withStateHandlers({}, {
        setState: state => (patch = {}) => ({...state, ...patch})
    })
)(WipRender);

export default Wip;