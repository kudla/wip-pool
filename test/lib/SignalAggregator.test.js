const {SignalAggregator} = require('../../lib/SignalAggregator');

describe.only('lib/SignalAggregator', () => {
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

    describe('add method', () => {
        let aggregator;
        beforeEach(() => {
            aggregator = new SignalAggregator();
        });

        it('should be a function', () => {
            expect(aggregator.add).to.be.instanceof(Function);
        });

        it('should affect aggregation with added signal', () => {
            const signal = 5;

            aggregator.add(signal);

            expect(aggregator).to.be.deep.equal({
                count: 1,
                sum: signal,
                avg: signal,
                min: signal,
                max: signal
            });
        });

        it('should skip non number signals', () => {
            aggregator.add('5');

            expect(aggregator).to.be.deep.equal({
                count: 0,
                sum: 0,
                avg: 0,
                min: null,
                max: null
            });
        });

        it('should affect aggregation with added signals', () => {
            const minSignal = 10;
            const maxSignal = 20;
            const signals = [minSignal, maxSignal];

            aggregator.add(...signals);

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

            aggregator.add(...signalSet1);
            aggregator.add(...signalSet2);

            expect(aggregator).to.be.deep.equal({
                count,
                sum,
                avg,
                min: minSignal,
                max: maxSignal
            });
        });
    });
});
