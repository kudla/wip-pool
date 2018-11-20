import React from 'react';
import {compose, setDisplayName, withStateHandlers, lifecycle, withHandlers, withProps, withPropsOnChange} from 'recompose';
import {WipPool} from 'wip-pool';
import {Button} from '@blueprintjs/core';
import {sortBy} from 'lodash';

import {getWipPrepareTime} from './utils/getWipPrepareTime';
import {wipFactory} from './utils/wipFactory';
import {completeConstruction} from './utils/completeConstruction';
import {pullAWip} from './utils/pullAWip';
import {addWip} from './utils/addWip';
import {demandsGC} from './utils/demandsGC';
import {utilizeWip} from './utils/utilizeWip';

import {Wip} from './Wip';

function FlowDemoRender({wipBufferLength, completeConstruction, wipBuffer, demands, demandAWip, wipCount, demandCount}) {
    return <div>
        <Button onClick={demandAWip} />
        <div>
            {
                wipBuffer.map(wip => (
                    <Wip key={wip.constructionOrder} wip={wip} completeConstruction={completeConstruction} />
                ))
            }
        </div>
        <div>buffer {wipBufferLength}</div>
        <div>demands {demands.length}</div>
        <div>created {wipCount}</div>
        <div>
            {
                demands.map(wip => (
                    <Wip key={wip.constructionOrder} wip={wip} completeConstruction={completeConstruction} />
                ))
            }
        </div>
    </div>
}

const AVG_WIP_PREPARE_TIME = 3000;
const WIP_PREPARE_TIME_DISTRIBUTION = 1000;

export const FlowDemo = compose(
    setDisplayName('FlowDemo'),
    withStateHandlers(
        {
            avgWipPrepareTime: AVG_WIP_PREPARE_TIME,
            wipPrepareTimeDistribution: WIP_PREPARE_TIME_DISTRIBUTION,
            constructionQueue: [],
            demands: [],
            wipCount: 0,
            doneCount: 0,
            demandCount: 0,
            usedCount: 0
        },
        {
            setState: () => patch => patch,
            completeConstruction,
            pullAWip,
            addWip,
            demandsGC,
            utilizeWip
        }
    ),
    withHandlers({
        getWipPrepareTime,

    }),
    withHandlers({
        wipFactory,
        demandAWip: ({wipPool, pullAWip, utilizeWip}) => () => {
            wipPool.nextWIP();
            pullAWip();
            utilizeWip();
        }
    }),
    lifecycle({
        componentDidMount() {
            const {setState, wipFactory, demandsGC} = this.props;
            const demandsGCTimer = setInterval(demandsGC, 1000);
            setState({
                wipPool: new WipPool(wipFactory),
                demandsGCTimer
            });
        }
    }),
    withProps(({
        wipPool
    }) => ({
        wipBufferLength: wipPool ? wipPool.wipBuffer.length : 0
    })),
    withPropsOnChange(['constructionQueue'], ({
        constructionQueue
    }) => ({
        wipBuffer: sortBy(constructionQueue, ['doneOrder', 'constructionOrder'])
    }))
)(FlowDemoRender);