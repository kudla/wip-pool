
class SignalAggregator {
    constructor() {
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
    }

    add(...signals) {
        signals
            .filter(signal => typeof signal === 'number')
            .forEach(signal => {
                this.count += 1;
                this.sum += signal;
                this.min = Math.min(...[this.min, signal].filter(Boolean));
                this.max = Math.max(...[this.max, signal].filter(Boolean));
            });

        this.avg = this.sum / (this.count || 1);
    }
}

module.exports = {
    SignalAggregator
};
