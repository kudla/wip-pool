const {calculateProcessMetrics} = require('../../../../lib/WipPool/planning/calculateProcessMetrics');


const INITIAL_STATS = {
    demandInterval: {
        min: 0,
        max: 0,
        avg: 0
    },
    prepareInterval: {
        min: 0,
        max: 0,
        avg: 0
    }
};


const DEMAND_MIN_INTERVAL = 500;
const DEMAND_AVG_INTERVAL = 1000;
const DEMAND_INTERVAL = {
    min: DEMAND_MIN_INTERVAL,
    avg: DEMAND_AVG_INTERVAL,
    max: 1500
};

const NOW = 10000;
const PREPARE_AVG_INTERVAL = 1000;
const PREPARE_MAX_INTERVAL = 1500;
const PREPARE_INTERVAL = {
    min: 500,
    avg: PREPARE_AVG_INTERVAL,
    max: PREPARE_MAX_INTERVAL
};

const PROGRESS_STATS = {
    demandInterval: DEMAND_INTERVAL,
    prepareInterval: PREPARE_INTERVAL
};

const DEFAULT_METRICS = {
    demandInterval: 0,
    prepareInterval: 0,
    demandIdle: 0,
    prepareLack: 0,
    reserveFactor: 1,
    reserveVolume: 1
};

const DEFAULT_PROGRESS_METRICS = {
    ...DEFAULT_METRICS,
    demandInterval: DEMAND_AVG_INTERVAL,
    prepareInterval: PREPARE_AVG_INTERVAL,
    prepareLack: 1
};

describe('lib/WipPool/planning/calculateProcessMetrics', () => {
    it('should be a function', () => {
        expect(calculateProcessMetrics).to.be.instanceof(Function);
    });

    it('should be resolved on initial stats', () => {
        expect(calculateProcessMetrics(INITIAL_STATS, NOW)).to.be.deep.equal(DEFAULT_METRICS);
    });

    it('should be resolved on progress stats', () => {
        expect(calculateProcessMetrics(PROGRESS_STATS, NOW))
            .to.be.deep.equal(DEFAULT_PROGRESS_METRICS);
    });

    it('should allow to define prepare interval estimation metric', () => {
        const prepareInterval = PREPARE_MAX_INTERVAL;
        expect(calculateProcessMetrics(PROGRESS_STATS, NOW, {estimationPrepareInterval: 'max'}))
            .to.be.deep.equal({
                ...DEFAULT_PROGRESS_METRICS,
                prepareInterval,
                prepareLack: prepareInterval / DEFAULT_PROGRESS_METRICS.demandInterval
            });
    });

    it('should allow to define custom prepare interval estimator', () => {
        const estimationPrepareInterval = ({avg, max}) => (avg + max) / 2;
        const prepareInterval = estimationPrepareInterval(PREPARE_INTERVAL);
        expect(calculateProcessMetrics(PROGRESS_STATS, NOW, {estimationPrepareInterval}))
            .to.be.deep.equal({
                ...DEFAULT_PROGRESS_METRICS,
                prepareInterval,
                prepareLack: prepareInterval / DEFAULT_PROGRESS_METRICS.demandInterval
            });
    });

    it('should allow to define demand interval estimation metric', () => {
        const demandInterval = DEMAND_MIN_INTERVAL;
        expect(calculateProcessMetrics(PROGRESS_STATS, NOW, {estimationDemandInterval: 'min'}))
            .to.be.deep.equal({
                ...DEFAULT_PROGRESS_METRICS,
                demandInterval,
                prepareLack: DEFAULT_PROGRESS_METRICS.prepareInterval / demandInterval
            });
    });

    it('should allow to define custom demand interval estimator', () => {
        const estimationDemandInterval = ({avg, max}) => (avg + max) / 2;
        const demandInterval = estimationDemandInterval(PREPARE_INTERVAL);
        expect(calculateProcessMetrics(PROGRESS_STATS, NOW, {estimationDemandInterval}))
            .to.be.deep.equal({
                ...DEFAULT_PROGRESS_METRICS,
                demandInterval,
                prepareLack: DEFAULT_PROGRESS_METRICS.prepareInterval / demandInterval
            });
    });

    it('should allow to define custom reserve factor', () => {
        const estimationReserveFactor = 5;
        expect(calculateProcessMetrics(PROGRESS_STATS, NOW, {estimationReserveFactor}))
            .to.be.deep.equal({
                ...DEFAULT_PROGRESS_METRICS,
                reserveFactor: estimationReserveFactor
            });
    });

    it('should allow to define custom reserve volume', () => {
        const estimationReserveVolume = 10;
        expect(calculateProcessMetrics(PROGRESS_STATS, NOW, {estimationReserveVolume}))
            .to.be.deep.equal({
                ...DEFAULT_PROGRESS_METRICS,
                reserveVolume: estimationReserveVolume
            });
    });

    it('should depends on demandIdle time', () => {
        const demandIdle = 100;
        const {
            prepareInterval,
            demandInterval
        } = DEFAULT_PROGRESS_METRICS;

        expect(calculateProcessMetrics({
            ...PROGRESS_STATS,
            lastDemandInterval: NOW - demandIdle
        }, NOW))
            .to.be.deep.equal({
                ...DEFAULT_PROGRESS_METRICS,
                demandIdle,
                prepareLack: (demandIdle + prepareInterval) / demandInterval
            });
    });
});
