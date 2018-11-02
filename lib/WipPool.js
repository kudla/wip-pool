const {WipDoneError} = require('./errors');
const {
    fromAsyncGenerator,
    fromIterable,
    fromIterator,
    fromFactory,
    fromNothing
} = require('./iterators');
const {SignalHistory} = require('./SignalHistory');

const iteratorFactories = [
    fromAsyncGenerator,
    fromIterable,
    fromIterator,
    fromFactory,
    fromNothing
];

function WipPool(source, options = {})  {
    if(!(this instanceof WipPool)) {
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

    const factories = new SignalHistory();

    const wipBuffer = [];

    Object.assign(
        this,
        {
            iterator,
            demands,
            factories,
            wipBuffer
        }
    );
}

Object.assign(
    WipPool.prototype,
    {
        nextWIP() {
            return this.next()
                .then(({value, done}) => done
                    ? Promise.reject(new WipDoneError())
                    : value
                );
        },

        getStats() {
            const {demands} = this;
            const demandTime = (demands.time.max - demands.time.min) || 1;
            const demandCount = demands.stats.sum;
            const demandRate = demandCount && demandCount / demandTime;
            return {
                demandRate
            };
        },

        next() {
            const {iterator, demands} = this;
            demands.addSignals(1);
            return iterator.next();
        }
    }
);


module.exports = {
    WipPool
};
