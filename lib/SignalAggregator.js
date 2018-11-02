const isNumber = value => typeof value === 'number';

class SignalAggregator {
    constructor(...signals) {
        Object.assign(
            this,
            {
                sum: 0,
                count: 0,
                min: null,
                max: null,
                avg: 0
            }
        );

        this.addSignals(...signals)
    }

    addSignals(...signals) {
        const infulentSignals = signals
            .filter(signal => typeof signal === 'number' || signal instanceof SignalAggregator);

        if (infulentSignals.length) {
            infulentSignals
                .map(signal => signal instanceof SignalAggregator
                    ? signal
                    : {
                        count: 1,
                        sum: signal,
                        min: signal,
                        max: signal
                    }
                )
                .forEach(signal => {
                    this.count += signal.count;
                    this.sum += signal.sum;

                    const mins = [this.min, signal.min].filter(isNumber);
                    this.min = mins.length ? Math.min(...mins) : null;

                    const maxs = [this.max, signal.max].filter(isNumber);
                    this.max = maxs.length ? Math.max(...maxs) : null;
                });

            this.avg = this.sum / (this.count || 1);
        }
    }

    clone(...signals) {
        const copy = Object.create(this);
        copy.addSignals(...signals);
        return copy;
    }
}

module.exports = {
    SignalAggregator
};
