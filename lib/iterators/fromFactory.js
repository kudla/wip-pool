const {WipDone} = require('../errors');

class FactoryIterator {
    constructor(factory) {
        Object.assign(
            this,
            {factory}
        );
    }

    next() {
        const {factory} = this;
        return new Promise(resolve => resolve(factory()))
            .then(
                value => ({value, done: false}),
                (error) => {
                    if (error instanceof WipDone) {
                        return {done: true, value: undefined};
                    }
                    return Promise.reject(error);
                }
            );
    }
}

function fromFactory(source) {
    if (source instanceof Function) {
        return new FactoryIterator(source);

    };
    return false;
}

module.exports = {
    fromFactory,
    FactoryIterator
};
