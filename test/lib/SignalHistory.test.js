const {useFakeTimers} = require('sinon');

const {SignalHistory} = require('../../lib/SignalHistory');
const {SignalAggregator} = require('../../lib/SignalAggregator');

const {DEFAULT_LENGTH_LIMIT} = SignalHistory;
const THOUSAND_YEARS = 1000 // years
    * 365 // days
    * 24 // hours
    * 60 // minutes
    * 60 // seconds
    * 1000; // milliseconds

describe('lib/SignalHistory', () => {
    let stats;
    let time;
    beforeEach(() => {
        stats = new SignalAggregator();
        time = new SignalAggregator();
    });

    afterEach(() => {
        stats = null;
        time = null;
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
            historyLength: DEFAULT_LENGTH_LIMIT,
            stats,
            time
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

        describe('stats', () => {
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

                clock.tick(THOUSAND_YEARS);

                history.addSignals(signal2);

                stats.addSignals(signal1, signal2);
                expect(history.stats).to.deep.equal(stats);
            });

            it(`should limit history length to ${DEFAULT_LENGTH_LIMIT} signals by default`, () => {
                history.addSignals(100);
                for (let signalIndex = 0; signalIndex < DEFAULT_LENGTH_LIMIT; signalIndex += 1) {
                    const signal = signalIndex;
                    history.addSignals(signal);
                    stats.addSignals(signal);
                }
                expect(history.stats).to.deep.equal(stats);
            });

            it('should limit history length with options', () => {
                const limitedHistory = new SignalHistory({historyLength: 2});

                const signals = [20, 30];

                limitedHistory.addSignals(10, ...signals);
                stats.addSignals(...signals);

                expect(limitedHistory.stats).to.deep.equal(stats);
            });

            it('should apply time window with options', () => {
                const timeWindow = 100;
                const limitedHistory = new SignalHistory({timeWindow});

                const signals = [20, 30];

                limitedHistory.addSignals(10);
                clock.tick(timeWindow + 1);
                limitedHistory.addSignals(...signals);
                stats.addSignals(...signals);

                expect(limitedHistory.stats).to.deep.equal(stats);
            });

            it('should cancel history length limit with options', () => {
                const unlimitedHistory = new SignalHistory({historyLength: null});

                for (let signalIndex = 0; signalIndex < 10000; signalIndex += 1) {
                    const signal = signalIndex;
                    unlimitedHistory.addSignals(signal);
                    stats.addSignals(signal);
                }

                expect(unlimitedHistory.stats).to.deep.equal(stats);
            });

            it('should limit history with timeWindow in case it is more strict restriction', () => {
                const timeWindow = 100;
                const limitedHistory = new SignalHistory({historyLength: 3, timeWindow});

                const signals = [10, 20];

                limitedHistory.addSignals(5);

                clock.tick(timeWindow + 1);

                limitedHistory.addSignals(...signals);
                stats.addSignals(...signals);

                expect(limitedHistory.stats).to.deep.equal(stats);
            });
        });

        describe('time', () => {
            it('should add time stats', () => {
                history.addSignals(0);
                time.addSignals(Date.now());

                clock.tick(100);

                history.addSignals(0);
                time.addSignals(Date.now());

                expect(history.time).to.be.deep.equal(time);
            });

            it('should add time stats on history with no limits', () => {
                const unlimitedHistory = new SignalHistory({
                    historyLength: null,
                    timeWindow: null
                });

                for (let signalIndex = 0; signalIndex < 10000; signalIndex += 1) {
                    unlimitedHistory.addSignals(0);
                    time.addSignals(Date.now());
                    clock.tick(1000);
                }

                expect(unlimitedHistory.time).to.be.deep.equal(time);
            });

            it('should add time stats on history with length limit', () => {
                const historyLength = 2;
                const limitedHistory = new SignalHistory({
                    historyLength
                });
                limitedHistory.addSignals(0);

                for (let signalIndex = 0; signalIndex < historyLength; signalIndex += 1) {
                    clock.tick(100);
                    limitedHistory.addSignals(0);
                    time.addSignals(Date.now());
                }

                expect(limitedHistory.time).to.be.deep.equal(time);
            });

            it('should add time stats on history with time window', () => {
                const timeWindow = 10;
                const limitedHistory = new SignalHistory({
                    timeWindow,
                    historyLength: null
                });

                limitedHistory.addSignals(0);

                for (let signalIndex = 0; signalIndex <= timeWindow; signalIndex += 5) {
                    clock.tick(5);
                    limitedHistory.addSignals(0);
                    time.addSignals(Date.now());
                }

                expect(limitedHistory.time).to.be.deep.equal(time);
            });
        });
    });
});
