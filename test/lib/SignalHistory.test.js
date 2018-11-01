const {SignalHistory} = require('../../lib/SignalHistory');
const {SignalAggregator} = require('../../lib/SignalAggregator');
const {useFakeTimers} = require('sinon');

const {DEFAULT_LENGTH_LIMIT} = SignalHistory;
const THAUSAND_YEARS = 1000 *   // years
    365 *   // days
    24 *    // hours
    60 *    // minutes
    60 *    // seconds
    1000    // milliseconds;

describe('lib/SignalHistory', () => {
    let stats;
    beforeEach(() => {
        stats = new SignalAggregator();
    });

    afterEach(() => {
        stats = null;
    });

    it('should be a SignalHistory class', () => {
        expect(SignalHistory).to.have.property('prototype');
        expect(SignalHistory.prototype.constructor, 'constructor').to.be.equal(SignalHistory);
        expect(SignalHistory.name, 'class name').to.be.equal('SignalHistory');
    });

    it('should create instance of SignalHistory', () => {
        expect(new SignalHistory()).to.be.instanceof(SignalHistory);
    });

    it('should have default options', () => {
        expect(new SignalHistory()).to.deep.include({
            timeWindow: null,
            lengthLimit: DEFAULT_LENGTH_LIMIT,
            stats
        });
    });

    describe('addSignals method', () => {
        let history;
        let clock;

        beforeEach(() => {
            clock = useFakeTimers();
            history = new SignalHistory();
        });

        afterEach(() => {
            clock.restore();
        });

        it('should be a function', () => {
            expect(history.addSignals).to.be.instanceof(Function);
        });

        it('should add signal to stats', () => {
            const signal = 100;

            history.addSignals(signal);

            stats.addSignals(signal);

            expect(history.stats).to.deep.equal(stats);
        });

        it('should add signals to stats', () => {
            const signals = [100, 200];

            history.addSignals(...signals);

            stats.addSignals(...signals);

            expect(history.stats).to.deep.equal(stats);
        });


        it('should incrementally add stats', () => {
            const signal1 = 100;
            const signal2 = 200;

            history.addSignals(signal1);
            history.addSignals(signal2);

            stats.addSignals(signal1, signal2);

            expect(history.stats).to.deep.equal(stats);
        });

        it('should not have time window by default', () => {
            const signal1 = 100;
            const signal2 = 200;

            history.addSignals(signal1);

            clock.tick(THAUSAND_YEARS);

            history.addSignals(signal2);

            stats.addSignals(signal1, signal2);
            expect(history.stats).to.deep.equal(stats);
        });

        it(`should limit history length to ${DEFAULT_LENGTH_LIMIT} signals by defaultt`, () => {
            history.addSignals(100);
            for(let signalIndex = 0; signalIndex < DEFAULT_LENGTH_LIMIT; signalIndex += 1) {
                const signal = signalIndex;
                history.addSignals(signal);
                stats.addSignals(signal);
            }
            expect(history.stats).to.deep.equal(stats);
        });

        it('should limit history length with options', () => {
            const history = new SignalHistory({lengthLimit: 2});

            const signals = [20, 30];

            history.addSignals(10, ...signals);
            stats.addSignals(...signals);

            expect(history.stats).to.deep.equal(stats);
        });

        it('should apply time window with options', () => {
            const timeWindow = 100;
            const history = new SignalHistory({timeWindow});

            const signals = [20, 30];

            history.addSignals(10);
            clock.tick(timeWindow + 1);
            history.addSignals(...signals);
            stats.addSignals(...signals);

            expect(history.stats).to.deep.equal(stats);
        });


        it('should cancel history length limit with options', () => {
            const history = new SignalHistory({lengthLimit: null});

            for(let signalIndex = 0; signalIndex < 10000; signalIndex += 1) {
                const signal = signalIndex;
                history.addSignals(signal);
                stats.addSignals(signal);
            }

            expect(history.stats).to.deep.equal(stats);
        });



        it('should limit history with timeWindow in case it is more strict reestriction', () => {
            const timeWindow = 100;
            const history = new SignalHistory({lengthLimit: 3, timeWindow});

            const signals = [10, 20];

            history.addSignals(5);

            clock.tick(timeWindow + 1);

            history.addSignals(...signals);
            stats.addSignals(...signals);

            expect(history.stats).to.deep.equal(stats);
        });

     });
});
