
const {
    promiseStatus,
    PROMISE_PENDING,
    PROMISE_RESOLVED
} = require('promise-status-async');
const {useFakeTimers} = require('sinon');

const {WipPool} = require('../../../lib/WipPool/WipPool');
const {WipDoneError} = require('../../../lib/errors');

const STANDARD_WIP_DELAY = 100;

describe('lib/WipPool/planning', () => {
    let nextWip;
    let wipQueue;
    let pool;
    let clock;

    function wipSource() {
        const currentWip = nextWip;
        nextWip += 1;
        if (!wipQueue.length) {
            throw new WipDoneError();
        }
        const prepareTime = wipQueue[currentWip % wipQueue.length];
        return new Promise(
            resolve => setTimeout(
                () => resolve({
                    index: currentWip,
                    prepareTime
                }),
                prepareTime
            )
        );
    }

    async function nodeTick(ticks = 10) {
        let steps = ticks;
        while (steps > 0) {
            await new Promise(resolve => process.nextTick(resolve));
            steps -= 1;
        }
    }

    async function tick(ticks = 0, nodeTicks) {
        for (let tickStep = 0; tickStep < ticks; tickStep += 1) {
            clock.tick(1);
            await nodeTick(nodeTicks);
        }
        await nodeTick(nodeTicks);
    }

    beforeEach(() => {
        clock = useFakeTimers();
        nextWip = 0;
        wipQueue = [];
        pool = new WipPool(wipSource);
    });

    afterEach(() => {
        clock.restore();
        clock = null;
        pool = null;
        wipQueue = null;
    });

    it('should return first wip with delay', async () => {
        wipQueue = [STANDARD_WIP_DELAY];
        const firstWip = pool.next();

        await tick(STANDARD_WIP_DELAY - 1);

        expect(await promiseStatus(firstWip), 'before wip prepared')
            .to.be.equal(PROMISE_PENDING);

        await tick(1);

        expect(await promiseStatus(firstWip), 'after wip prepared')
            .to.be.equal(PROMISE_RESOLVED);
    });

    it('should return second wip with no delay', async () => {
        wipQueue = [STANDARD_WIP_DELAY];
        pool.next();
        await tick(STANDARD_WIP_DELAY);

        const secondWip = pool.next();
        await tick();

        expect(await promiseStatus(secondWip))
            .to.be.equal(PROMISE_RESOLVED);
    });

    it('should increase buffer according to demands prepare time ratio', async () => {
        const demandInterval = 3;
        const prepareDeficit = 4;
        const prepareTime = demandInterval * prepareDeficit;
        const estimationReserveVolume = 0;

        pool = new WipPool(
            () => new Promise(resolve => setTimeout(resolve, prepareTime)),
            {
                estimationReserveVolume,
                estimationReserveFactor: 1
            }
        );

        for (let demandIndex = 0; demandIndex < prepareDeficit * 2; demandIndex += 1) {
            await tick(demandInterval);
            pool.next();
        }

        const resolvedWipStatuses = [];
        for (let demandIndex = 0; demandIndex < prepareDeficit; demandIndex += 1) {
            await tick(demandInterval);
            const wip = pool.next();
            await tick();
            resolvedWipStatuses.push(await promiseStatus(wip));
        }
        const immediateWip = pool.next();
        await tick();
        const immediateWipStatus = await promiseStatus(immediateWip);


        expect(resolvedWipStatuses, 'wip statuses for estimated demands')
            .to.be.deep.equal([...new Array(prepareDeficit)].map(() => PROMISE_RESOLVED));

        expect(immediateWipStatus, 'wip status for immediate demand')
            .to.be.equal(PROMISE_PENDING);
    });
});
