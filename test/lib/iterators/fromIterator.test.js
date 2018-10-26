const {fromIterator} = require('../../../lib/iterators');

const {iteratorTest} = require('./iteratorTest');

describe('lib/iterators/fromIterator', () => {
    function sourceFactory(sequence) {
        let index = -1;
        return {
            next() {
                return new Promise(resolve => {
                    index += 1;
                    if (index < sequence.length) {
                        return resolve({
                            value: sequence[index],
                            done: false
                        });
                    }
                    resolve({
                        done: true,
                        value: undefined
                    });
                });
            }
        }
    }
    iteratorTest(fromIterator, sourceFactory);
});