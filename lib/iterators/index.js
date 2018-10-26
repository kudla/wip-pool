const fromAsyncGenerator = require('./fromAsyncGenerator');
const fromIterable = require('./fromIterable');
const fromIterator = require('./fromIterator');
const fromFactory = require('./fromFactory');
const fromNothing = require('./fromNothing');

Object.assign(
    module.exports,
    fromAsyncGenerator,
    fromIterable,
    fromIterator,
    fromFactory,
    fromNothing
);
