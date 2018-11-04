const {WipDoneError} = require('../errors');
const {
    fromAsyncGenerator,
    fromIterable,
    fromIterator,
    fromFactory,
    fromNothing
} = require('../iterators');
const {SignalHistory} = require('../SignalHistory');
const {SignalAggregator} = require('../SignalAggregator');

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
    const demandHistory = new SignalHistory({
        historyLength: demandHistoryLength,
        timeWindow: demandTimeWindow
    });

    const prepareHistory = new SignalHistory();

    const wipBuffer = [];
    const inProgress = [];

    Object.assign(
        this,
        {
            iterator,
            demandHistory,
            prepareHistory,
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
            const {demandHistory, inProgress} = this;
            const now = Date.now();
            const demandTime = (now - demandHistory.time.min) || 1;
            const demandCount = demandHistory.stats.sum;
            const demandRate = demandCount && demandCount / demandTime;

            const inProgressTimes = inProgress
                .map(({start}) => now - start);
            const prepareHistory = new SignalAggregator(this.prepareHistory.stats, ...inProgressTimes);

            const prepareTime = {
                avg: prepareHistory.avg,
                min: Number(prepareHistory.min),
                max: Number(prepareHistory.max)
            };
            return {
                demandRate,
                prepareTime
            };
        },

        prepareWip() {
            const start = Date.now();
            const {prepareHistory, iterator, inProgress} = this;
            const wip = iterator.next();
            const progress = {start};
            inProgress.push(progress);
            wip
                .then(() => {
                    prepareHistory.addSignals(Date.now() - start);
                    const progressIndex = inProgress.indexOf(progress);
                    inProgress.splice(progressIndex, 1);
                });
            return wip;
        },

        next() {
            const {demandHistory} = this;
            demandHistory.addSignals(1);
            return this.prepareWip();
        }
    }
);


module.exports = {
    WipPool
};
