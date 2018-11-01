const {WipPool} = require('../../../lib/WipPool');
const {WipDoneError} = require('../../../lib/errors');
const {useFakeTimers} = require('sinon');

const {
    promiseStatus,
    PROMISE_PENDING,
    PROMISE_RESOLVED
} = require('promise-status-async');

const STANDARD_WIP_DELAY = 10;
describe('lib/WipPool/planning', () => {
    let nextWip;
    let wipQueue;
    let pool;
    let clock;

    function wipSource() {
        const currentWip = nextWip;
        nextWip += 1;
        if (currentWip >= wipQueue.length) {
            throw new WipDoneError();
        }
        const prepareTime = wipQueue[currentWip];
        return new Promise(resolve =>
            setTimeout(
                () => resolve({
                    index: currentWip,
                    prepareTime
                }),
                prepareTime
            )
        );
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

        clock.next(STANDARD_WIP_DELAY - 1);
        expect((await promiseStatus(firstWip)), 'before wip prepared')
            .to.be.equal(PROMISE_PENDING);

        clock.next(1);
        expect((await promiseStatus(firstWip)), 'after wip prepared')
            .to.be.equal(PROMISE_RESOLVED);

    });

    it('should return first wip with delay', async () => {
        wipQueue = [STANDARD_WIP_DELAY];
        const firstWip = pool.next();

        clock.next(STANDARD_WIP_DELAY - 1);
        expect((await promiseStatus(firstWip)), 'before wip prepared')
            .to.be.equal(PROMISE_PENDING);

        clock.next(1);
        expect((await promiseStatus(firstWip)), 'after wip prepared')
            .to.be.equal(PROMISE_RESOLVED);

    });

    it.skip('should return second wip with no delay', async () => {
        wipQueue = [STANDARD_WIP_DELAY];
        pool.next();
        clock.next(STANDARD_WIP_DELAY);

        const secondtWip = pool.next();

        expect((await promiseStatus(secondtWip)))
            .to.be.equal(PROMISE_RESOLVED);
    });
});
