const {fromIterable} = require('../../../lib/iterators');

const {iteratorTest} = require('./iteratorTest');

describe('lib/iterators/fromIterable', () => {
    iteratorTest(fromIterable, source => source);
});
