const {WipPool} = require('../../../../lib/WipPool');
const {useFakeTimers} = require('sinon');

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

        it('should be affected with incoming demands', () => {
            pool = new WipPool(() => {});
            const demandInterval = 1000;
            const demandRate = 1 / demandInterval;
            const demandCount = 10;
            for(let demandIndex = 0; demandIndex < demandCount; demandIndex += 1) {
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
            for(let demandIndex = 0; demandIndex < demandHistoryLength; demandIndex += 1) {
                pool.next();
                clock.tick(demandInterval * 1000);
            }

            for(let demandIndex = 0; demandIndex < demandHistoryLength; demandIndex += 1) {
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
            for(let demandIndex = 0; demandIndex < demandCount; demandIndex += 1) {
                pool.next();
                clock.tick(demandInterval * 1000);
            }
            clock.tick(demandTimeWindow);

            for(let demandIndex = 0; demandIndex < demandCount; demandIndex += 1) {
                pool.next();
                clock.tick(demandInterval);
            }
            expect(pool.getStats().demandRate).to.be.equal(demandRate);
        });
    });
});
