const {WipDoneError} = require('./errors');
const {
    fromAsyncGenerator,
    fromIterable,
    fromIterator,
    fromFactory,
    fromNothing
} = require('./iterators');
const {SignalHistory} = require('./SignalHistory');
const {SignalAggregator} = require('./SignalAggregator');

const iteratorFactories = [
    fromAsyncGenerator,
    fromIterable,
    fromIterator,
    fromFactory,
    fromNothing
];

function WipPool(source, options = {}) {
    if (!(this instanceof WipPool)) {
        return new WipPool(source, options);
    }

    const iterator = iteratorFactories
        .reduce((found, factory) => found || factory(source), false);

    const {
        demandHistoryLength,
        demandTimeWindow
    } = options;
    const demands = new SignalHistory({
        historyLength: demandHistoryLength,
        timeWindow: demandTimeWindow
    });

    const prepares = new SignalHistory();

    const wipBuffer = [];
    const inProgress = [];

    Object.assign(
        this,
        {
            iterator,
            demands,
            prepares,
            wipBuffer,
            inProgress
        }
    );
}

Object.assign(
    WipPool.prototype,
    {
        nextWIP() {
            return this.next()
                .then(({value, done}) => (done
                    ? Promise.reject(new WipDoneError())
                    : value)
                );
        },

        getStats() {
            const {demands, inProgress} = this;
            const now = Date.now();
            const demandTime = (now - demands.time.min) || 1;
            const demandCount = demands.stats.sum;
            const demandRate = demandCount && demandCount / demandTime;

            const inProgressTimes = inProgress
                .map(({start}) => now - start);
            const prepares = new SignalAggregator(this.prepares.stats, ...inProgressTimes);

            const prepareTime = {
                avg: prepares.avg,
                min: Number(prepares.min),
                max: Number(prepares.max)
            };
            return {
                demandRate,
                prepareTime
            };
        },

        prepareWip() {
            const start = Date.now();
            const {prepares, iterator, inProgress} = this;
            const wip = iterator.next();
            const progress = {start};
            inProgress.push(progress);
            wip
                .then(() => {
                    prepares.addSignals(Date.now() - start);
                    const progressIndex = inProgress.indexOf(progress);
                    inProgress.splice(progressIndex, 1);
                });
            return wip;
        },

        next() {
            const {demands} = this;
            demands.addSignals(1);
            return this.prepareWip();
        }
    }
);


module.exports = {
    WipPool
};
