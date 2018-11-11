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

    describe('demandInterval', () => {
        it('should be Infinity by default', () => {
            pool = new WipPool(() => {});
            expect(pool.getStats()).to.deep.include({demandInterval: new SignalAggregator(Infinity)});
        });

        it('should be Infinity after one request', () => {
            pool = new WipPool(() => {});
            pool.next();
            expect(pool.getStats()).to.deep.include({demandInterval: new SignalAggregator(Infinity)});
        });

        it('should be initialDemandInterval at start', () => {
            const initialDemandInterval = 300;
            pool = new WipPool(() => {}, {initialDemandInterval});
            expect(pool.getStats()).to.deep.include({demandInterval: new SignalAggregator(initialDemandInterval)});
        });


        it('should be initialDemandInterval after first request', () => {
            const initialDemandInterval = 300;
            pool = new WipPool(() => {}, {initialDemandInterval});
            pool.next();
            expect(pool.getStats()).to.deep.include({demandInterval: new SignalAggregator(initialDemandInterval)});
        });


        it('should be affected with incoming demandHistory', () => {
            pool = new WipPool(() => {});
            const demandInterval = 1000;
            const demandCount = 2;

            for (let demandIndex = 0; demandIndex < demandCount; demandIndex += 1) {
                pool.next();
                clock.tick(demandInterval);
            }

            expect(pool.getStats().demandInterval).to.be.deep.equal(new SignalAggregator(demandInterval));
        });

        it('should use limited history', () => {
            const demandHistoryLength = 5;
            pool = new WipPool(() => {}, {demandHistoryLength});
            const demandInterval = 10;

            // more rare demands out of history range
            for (let demandIndex = 0; demandIndex < demandHistoryLength; demandIndex += 1) {
                pool.next();
                clock.tick(demandInterval * 5);
            }

            for (let demandIndex = 0; demandIndex < demandHistoryLength + 1; demandIndex += 1) {
                clock.tick(demandInterval);
                pool.next();
            }
            expect(pool.getStats().demandInterval)
                .to.be.deep.equal(
                    new SignalAggregator(
                        ...[...new Array(demandHistoryLength)]
                            .map(
                                () => demandInterval
                            )
                    )
                );
        });

        it('should use history from timeWindow', async () => {
            const demandInterval = 10;
            const demandCount = 3;
            const demandTimeWindow = demandInterval * demandCount - 1;
            pool = new WipPool(() => {}, {demandTimeWindow});

            // more rare demands out of history range
            for (let demandIndex = 0; demandIndex < demandCount; demandIndex += 1) {
                pool.next();
                clock.tick(demandInterval * 5);
            }
            clock.tick(demandTimeWindow);

            for (let demandIndex = 0; demandIndex < demandCount + 1; demandIndex += 1) {
                pool.next();
                clock.tick(demandInterval);
            }

            expect(pool.getStats().demandInterval)
                .to.be.deep.equal(
                    new SignalAggregator(
                        ...[...new Array(demandCount)]
                            .map(
                                () => demandInterval
                            )
                    )
                );
        });
    });

    describe('prepareInterval', () => {
        it('should be 0 by default', () => {
            pool = new WipPool(() => {});
            expect(pool.getStats().prepareInterval).to.be.deep.equal({
                min: 0,
                max: 0,
                avg: 0
            });
        });

        it('should be initialPrepareInterval by default', () => {
            const initialPrepareInterval = 10;
            pool = new WipPool(() => {}, {initialPrepareInterval});
            expect(pool.getStats().prepareInterval).to.be.deep.equal(
                pick(new SignalAggregator(initialPrepareInterval), 'min', 'max', 'avg')
            );
        });

        it('should be the longest preparing duration if non is ready ', async () => {
            pool = new WipPool(() => new Promise(resolve => setTimeout(resolve, DEFAULT_PREPARE_TIME * 3)));

            const demandCount = 2;

            for (let prepareIndex = 0; prepareIndex < demandCount; prepareIndex += 1) {
                pool.prepareWip();
                clock.tick(DEFAULT_PREPARE_TIME);
            }

            expect(pool.getStats().prepareInterval).to.be.deep.equal(
                pick(new SignalAggregator(DEFAULT_PREPARE_TIME * demandCount), 'min', 'max', 'avg')
            );
        });


        it('should add stats on wip is prepared', async () => {
            pool = new WipPool(() => new Promise(resolve => setTimeout(resolve, DEFAULT_PREPARE_TIME)));
            const {wip} = pool.prepareWip();
            clock.tick(DEFAULT_PREPARE_TIME);
            await wip;

            expect(pool.getStats().prepareInterval).to.be.deep.equal(
                pick(new SignalAggregator(DEFAULT_PREPARE_TIME), 'min', 'max', 'avg')
            );
        });

        it('should not add stats on preparing wip if ready ones exist', async () => {
            pool = new WipPool(() => new Promise(resolve => setTimeout(resolve, DEFAULT_PREPARE_TIME * 2)));
            const {wip} = pool.prepareWip();
            clock.tick(DEFAULT_PREPARE_TIME);
            pool.prepareWip();
            clock.tick(DEFAULT_PREPARE_TIME);
            await wip;

            expect(pool.getStats().prepareInterval).to.be.deep.equal(
                pick(new SignalAggregator(DEFAULT_PREPARE_TIME * 2), 'min', 'max', 'avg')
            );
        });
    });

    describe('lastDemandInterval', () => {
        it('should be undefined initially', () => {
            expect(new WipPool().getStats().lastDemandInterval).to.be.equal(undefined);
        });

        it('should store last demand interval time', () => {
            pool = new WipPool(() => Promise.resolve());

            clock.tick(1000);
            pool.next();

            clock.tick(1000);
            pool.next();

            expect(pool.getStats().lastDemandInterval).to.be.equal(Date.now());
        });
    });
});
