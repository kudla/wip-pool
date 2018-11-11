const calculateProcessMetrics = require('./calculateProcessMetrics');
const estimateWipLack = require('./estimateWipLack');

Object.assign(
    module.exports,
    calculateProcessMetrics,
    estimateWipLack
);
