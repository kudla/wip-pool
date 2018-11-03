const debug = require('debug')('WipPool:estimateBufferLength');

const DEFAULT_RESERVE_VOLUME = 1;
const DEFAULT_RESERVE_FACTOR = 1;
const DEFAULT_PREPARE_TIME_METRIC = 'avg';

function estimatePrepareTime(prepareStats, options = {}) {
    let {
        estimationPrepareTime = DEFAULT_PREPARE_TIME_METRIC
    } = options;

    if (!(estimationPrepareTime in prepareStats)) {
        debug('unknown prepare time metric', estimationPrepareTime);
        estimationPrepareTime = DEFAULT_PREPARE_TIME_METRIC;
    }

    return prepareStats[estimationPrepareTime];
}

function estimateBufferLength(stats, options = {}) {
    const {
        demandRate,
        prepareTime
    } = stats;

    const {
        estimationReserveVolume = DEFAULT_RESERVE_VOLUME,
        estimationReserveFactor = DEFAULT_RESERVE_FACTOR,
        estimationPrepareTime
    } = options;

    const getEstimatedPrepareTime = typeof estimationPrepareTime === 'function'
        ? estimationPrepareTime
        : estimatePrepareTime;

    const estimatedPrepareTime = getEstimatedPrepareTime(prepareTime, options);

    return demandRate * estimatedPrepareTime * estimationReserveFactor + estimationReserveVolume;
}

module.exports = {
    estimateBufferLength
};
