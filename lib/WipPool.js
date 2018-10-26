const {WipDone} = require('./errors');
const {
    fromAsyncGenerator,
    fromIterable,
    fromIterator,
    fromFactory,
    fromNothing
} = require('./iterators');

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

    this.iterator = iteratorFactories
        .reduce((found, factory) => found || factory(source), false);
}

Object.assign(
    WipPool.prototype,
    {
        nextWIP() {
            return this.next()
                .then(({value, done}) => done
                    ? Promise.reject(new WipDone())
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
