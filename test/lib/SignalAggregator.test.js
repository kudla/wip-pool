const {SignalAggregator} = require('../../lib/SignalAggregator');

describe('lib/SignalAggregator', () => {
    it('should be a SignalAggregator class', () => {
        expect(SignalAggregator).to.have.property('prototype');
        expect(SignalAggregator.prototype.constructor, 'constructor').to.be.equal(SignalAggregator);
        expect(SignalAggregator.name, 'class name').to.be.equal('SignalAggregator');
    });

    it('should create instance of SignalAggregator', () => {
        expect(new SignalAggregator()).to.be.instanceof(SignalAggregator);
    });

    it('should have initial aggregations', () => {
        expect(new SignalAggregator()).to.be.deep.equal({
            count: 0,
            sum: 0,
            avg: 0,
            min: null,
            max: null
        });
    });

    describe('addSignals method', () => {
        let aggregator;

        beforeEach(() => {
            aggregator = new SignalAggregator();
        });

        afterEach(() => {
            aggregator = null;
        });

        it('should be a function', () => {
            expect(aggregator.addSignals).to.be.instanceof(Function);
        });

        it('should affect aggregation with added signal', () => {
            const signal = 5;

            aggregator.addSignals(signal);

            expect(aggregator).to.be.deep.equal({
                count: 1,
                sum: signal,
                avg: signal,
                min: signal,
                max: signal
            });
        });

        it('should skip non number signals', () => {
            aggregator.addSignals('5');

            expect(aggregator).to.be.deep.equal(new SignalAggregator());
        });

        it('should affect aggregation with added signals', () => {
            const minSignal = 10;
            const maxSignal = 20;
            const signals = [minSignal, maxSignal];

            aggregator.addSignals(...signals);

            expect(aggregator).to.be.deep.equal({
                count: signals.length,
                sum: minSignal + maxSignal,
                avg: (minSignal + maxSignal) / 2,
                min: minSignal,
                max: maxSignal
            });
        });

        it('should produce incremental aggregation', () => {
            const minSignal = 10;
            const signal1 = 20;
            const signal2 = 30;
            const maxSignal = 40;


            const signalSet1 = [minSignal, signal1];
            const signalSet2 = [signal2, maxSignal];

            const sum = minSignal + signal1 + signal2 + maxSignal;
            const count = [...signalSet1, ...signalSet2].length;
            const avg = sum / count;

            aggregator.addSignals(...signalSet1);
            aggregator.addSignals(...signalSet2);

            expect(aggregator).to.be.deep.equal({
                count,
                sum,
                avg,
                min: minSignal,
                max: maxSignal
            });
        });

        it('should be initiated with signals on creation', () => {
            const signals = [10, 20];

            const aggregator1 = new SignalAggregator(...signals);
            const aggregator2 = new SignalAggregator();

            aggregator2.addSignals(...signals);

            expect(aggregator1).to.be.deep.equal(aggregator2);
        });

        it('should compare zero values for min', () => {
            const signals = [0, 10];

            aggregator.addSignals(...signals);

            expect(aggregator).to.be.deep.include({min: 0});
        });

        it('should compare zero values for max', () => {
            const signals = [0, -10];

            aggregator.addSignals(...signals);

            expect(aggregator).to.be.deep.include({max: 0});
        });

        it('should accept other SignalAggregator', () => {
            const signals1 = [10, 20];
            const signals2 = [30, 40];

            aggregator.addSignals(
                ...signals1,
                new SignalAggregator(...signals2)
            );

            expect(aggregator).to.deep.equal(new SignalAggregator(...signals1, ...signals2));
        });

        it('should accept empty SignalAggregator', () => {
            const signals = [10, 20];

            aggregator.addSignals(
                ...signals,
                new SignalAggregator()
            );

            expect(aggregator).to.deep.equal(new SignalAggregator(...signals));
        });
    });
});
