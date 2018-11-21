const debug = require('debug')('WipPool:estimationMetrics');

const DEFAULT_RESERVE_VOLUME = 1;
const DEFAULT_RESERVE_FACTOR = 1;
const DEFAULT_PREPARE_TIME_METRIC = 'avg';

function estimatePrepareInterval(prepareStats, options = {}) {
    let {
        estimationPrepareInterval = DEFAULT_PREPARE_TIME_METRIC
    } = options;

    if (!(estimationPrepareInterval in prepareStats)) {
        debug('unknown prepare time metric', estimationPrepareInterval);
        estimationPrepareInterval = DEFAULT_PREPARE_TIME_METRIC;
    }

    return prepareStats[estimationPrepareInterval];
}

function estimateDemandInterval(demandStats, options = {}) {
    let {
        estimationDemandInterval = DEFAULT_PREPARE_TIME_METRIC
    } = options;

    if (!(estimationDemandInterval in demandStats)) {
        debug('unknown demand interval metric', estimationDemandInterval);
        estimationDemandInterval = DEFAULT_PREPARE_TIME_METRIC;
    }

    return demandStats[estimationDemandInterval];
}

function calculateProcessMetrics(stats, options = {}) {
    const {
        demandInterval: demandStats,
        prepareInterval: prepareStats,
        demandIdle
    } = stats;

    const {
        estimationReserveVolume = DEFAULT_RESERVE_VOLUME,
        estimationReserveFactor = DEFAULT_RESERVE_FACTOR,
        estimationPrepareInterval,
        estimationDemandInterval
    } = options;

    const getEstimatedPrepareInterval = typeof estimationPrepareInterval === 'function'
        ? estimationPrepareInterval
        : estimatePrepareInterval;

    const getEstimatedDemandInterval = typeof estimationDemandInterval === 'function'
        ? estimationDemandInterval
        : estimateDemandInterval;

    const demandInterval = getEstimatedDemandInterval(demandStats, options);
    const prepareInterval = getEstimatedPrepareInterval(prepareStats, options);
    const prepareLack = demandInterval
        && (demandIdle + prepareInterval) / demandInterval;

    return {
        demandInterval,
        prepareInterval,
        demandIdle,
        reserveFactor: estimationReserveFactor,
        reserveVolume: estimationReserveVolume,
        prepareLack
    };
}

module.exports = {
    calculateProcessMetrics
};
