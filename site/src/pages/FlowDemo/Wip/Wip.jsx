import React from 'react';
import {compose, withStateHandlers, setDisplayName} from 'recompose';
import {Spinner, Intent, Callout, Button} from '@blueprintjs/core';

function WipRender({wip, setState}) {
    const {
        doneOrder,
        constructionOrder,
        completeConstruction
    } = wip;

    if (typeof doneOrder === 'number') {
        return (
            <Callout className="wps-wip" intent={Intent.SUCCESS} icon={null} >
            <Spinner small value="1" intent={Intent.SUCCESS} />
            {/* <span>ready</span> */}
            #{constructionOrder}
        </Callout>
        );
    }

    const {
        start,
        prepareTime,
    } = wip;

    const now = Date.now();
    const progress = Math.max((now - start) / (prepareTime || 1));
    setTimeout(setState, 50);
    return (
        <Callout className="wps-wip">
            <Button minimal small onClick={completeConstruction}><Spinner small value={progress} /></Button>
            {/* <span>ready</span> */}
            #{constructionOrder}
        </Callout>
    )
}

export const Wip = compose(
    setDisplayName('Wip'),
    withStateHandlers({}, {
        setState: state => (patch = {}) => ({...state, ...patch})
    })
)(WipRender);

export default Wip;