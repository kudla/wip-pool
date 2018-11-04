const {useFakeTimers} = require('sinon');
const {pick} = require('lodash');

const {WipPool} = require('../../../../lib/WipPool');
const {SignalAggregator} = require('../../../../lib/SignalAggregator');

const DEFAULT_PREPARE_TIME = 1000;

describe('lib/WipPool:planning:stats', () => {
    let pool;
    let clock;

    beforeEach(() => {
        clock = useFakeTimers();
    });

    afterEach(() => {
        pool = null;
        clock.restore();
        clock = null;
    });

    it('should be a function', () => {
        expect(new WipPool().getStats).to.be.instanceof(Function);
    });

    describe('demandRate', () => {
        it('should be 0 by default', () => {
            pool = new WipPool(() => {});
            expect(pool.getStats()).to.deep.include({demandRate: 0});
        });

        it('should be affected with incoming demandHistory', () => {
            pool = new WipPool(() => {});
            const demandInterval = 1000;
            const demandRate = 1 / demandInterval;
            const demandCount = 10;
            for (let demandIndex = 0; demandIndex < demandCount; demandIndex += 1) {
                pool.next();
                clock.tick(demandInterval);
            }
            expect(pool.getStats().demandRate).to.be.equal(demandRate);
        });

        it('should use limited history', () => {
            const demandHistoryLength = 5;
            pool = new WipPool(() => {}, {demandHistoryLength});
            const demandInterval = 1000;
            const demandRate = 1 / demandInterval;

            // too rare demands out of history range
            for (let demandIndex = 0; demandIndex < demandHistoryLength; demandIndex += 1) {
                pool.next();
                clock.tick(demandInterval * 1000);
            }

            for (let demandIndex = 0; demandIndex < demandHistoryLength; demandIndex += 1) {
                pool.next();
                clock.tick(demandInterval);
            }
            expect(pool.getStats().demandRate).to.be.equal(demandRate);
        });

        it('should use history from timeWindow', () => {
            const demandInterval = 1000;
            const demandRate = 1 / demandInterval;
            const demandCount = 10;
            const demandTimeWindow = demandInterval * demandCount;
            pool = new WipPool(() => {}, {demandTimeWindow});

            // too rare demands out of history range
            for (let demandIndex = 0; demandIndex < demandCount; demandIndex += 1) {
                pool.next();
                clock.tick(demandInterval * 1000);
            }
            clock.tick(demandTimeWindow);

            for (let demandIndex = 0; demandIndex < demandCount; demandIndex += 1) {
                pool.next();
                clock.tick(demandInterval);
            }
            expect(pool.getStats().demandRate).to.be.equal(demandRate);
        });
    });

    describe('prepareTime', () => {
        it('should be 0 by default', () => {
            pool = new WipPool(() => {});
            expect(pool.getStats().prepareTime).to.be.deep.equal({
                min: 0,
                max: 0,
                avg: 0
            });
        });

        it('should add stats on wip is prepared', async () => {
            pool = new WipPool(() => new Promise(resolve => setTimeout(resolve, DEFAULT_PREPARE_TIME)));
            const wip = pool.prepareWip();
            clock.tick(DEFAULT_PREPARE_TIME);
            await wip;
            clock.tick(DEFAULT_PREPARE_TIME);

            expect(pool.getStats().prepareTime).to.be.deep.equal(
                pick(new SignalAggregator(DEFAULT_PREPARE_TIME), 'min', 'max', 'avg')
            );
        });

        it('should add stats of wip that is currently preparing', async () => {
            const HALF_TIME = DEFAULT_PREPARE_TIME / 2;
            pool = new WipPool(() => new Promise(resolve => setTimeout(resolve, DEFAULT_PREPARE_TIME)));
            let wip = pool.prepareWip();
            clock.tick(DEFAULT_PREPARE_TIME);
            await wip;
            wip = pool.prepareWip();
            clock.tick(HALF_TIME);

            expect(pool.getStats().prepareTime).to.be.deep.equal(
                pick(new SignalAggregator(DEFAULT_PREPARE_TIME, HALF_TIME), 'min', 'max', 'avg')
            );
        });
    });
});
