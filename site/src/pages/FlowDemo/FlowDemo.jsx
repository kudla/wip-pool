import React from 'react';
import {compose, setDisplayName, withStateHandlers, lifecycle, withHandlers, withProps, withPropsOnChange} from 'recompose';
import {WipPool} from 'wip-pool';
import {Button, Card, FormGroup} from '@blueprintjs/core';
import {sortBy} from 'lodash';

import {getWipPrepareTime} from './utils/getWipPrepareTime';
import {wipFactory} from './utils/wipFactory';
import {completeConstruction} from './utils/completeConstruction';
import {pullAWip} from './utils/pullAWip';
import {addWip} from './utils/addWip';
import {demandsGC} from './utils/demandsGC';
import {utilizeWip} from './utils/utilizeWip';
import {processConstructions} from './utils/processConstructions';

import {Wip} from './Wip';

function FlowDemoRender({completeConstruction, wipBuffer, demands, demandAWip}) {
    return <div className="wps-flow-demo">
        <h3>How WIP pool works</h3>
        <FormGroup>
            <Card>
                <h4>Wip pool</h4>
                <div className="wps-wip-container">
                    {
                        wipBuffer.map(wip => (
                            <Wip key={wip.constructionOrder} wip={wip} completeConstruction={completeConstruction} />
                        ))
                    }
                </div>
            </Card>
        </FormGroup>
        <FormGroup>
            <Card>
                <h4>Wip consumer <Button onClick={demandAWip} text="Demand a wip"/></h4>
                <div className="wps-wip-container">
                    {
                        demands.map(wip => (
                            <Wip key={wip.constructionOrder} wip={wip} completeConstruction={completeConstruction} />
                        ))
                    }
                </div>
            </Card>
        </FormGroup>
        <FormGroup>

        </FormGroup>
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
            usedCount: 0,
            lastProcessing: 0
        },
        {
            setState: () => patch => patch,
            completeConstruction,
            pullAWip,
            addWip,
            demandsGC,
            utilizeWip,
            processConstructions
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
            const {setState, wipFactory, demandsGC, processConstructions} = this.props;
            const demandsGCTimer = setInterval(demandsGC, 1000);
            setState({
                wipPool: new WipPool(wipFactory, {
                    demandHistoryLength: 7,
                    demandTimeWindow: 7000,
                    prepareHistoryLength: 7,
                    prepareTimeWindow: 7000
                }),
                demandsGCTimer
            });
            this.mounted = true;

            const process = now => {
                if (!this.mounted) {
                    return;
                }
                now && processConstructions(now);
                requestAnimationFrame(process);
            }
            process();
        },
        componentWillUnmount() {
            delete this.mounted;
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