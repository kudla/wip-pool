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

function WipPool(source)  {
    if(!(this instanceof WipPool)) {
        return new WipPool(source);
    }

    const iterator = iteratorFactories
        .reduce((found, factory) => found || factory(source), false);
    const demands = new SignalHistory();
    const factories = new SignalHistory();

    const wipQueue = [];

    Object.assign(
        this,
        {
            iterator,
            demands,
            factories,
            wipQueue
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

        next() {
            const {iterator} = this;
            return iterator.next();
        }
    }
);


module.exports = {
    WipPool
};
