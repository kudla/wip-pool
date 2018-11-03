const {estimateBufferLength} = require('../../../../lib/WipPool/planning/estimateBufferLength');


const INITIAL_STATS = {
    demandRate: 0,
    prepareTime: {
        min: 0,
        max: 0,
        avg: 0
    }
};


const DEMAND_RATE = 0.001;
const PREPARE_AVG_TIME = 1000;
const PREPARE_MAX_TIME = 1500;
const PREPARE_TIME = {
    min: 500,
    avg: PREPARE_AVG_TIME,
    max: PREPARE_MAX_TIME
};

const PROCESS_STATS = {
    demandRate: DEMAND_RATE,
    prepareTime: PREPARE_TIME
};

const RESERVE_VOLUME = 1;

describe('lib/WipPool/planning/estimateBufferLength', () => {
    it('should be a function', () => {
        expect(estimateBufferLength).to.be.instanceof(Function);
    });

    it('should be resolved on initial stats', () => {
        expect(estimateBufferLength(INITIAL_STATS)).to.be.equal(RESERVE_VOLUME);
    });

    it('should be resolved on process stats', () => {
        expect(estimateBufferLength(PROCESS_STATS))
            .to.be.equal(DEMAND_RATE * PREPARE_AVG_TIME + RESERVE_VOLUME);
    });

    it('should allow to define prepare time estimation metric', () => {
        expect(estimateBufferLength(PROCESS_STATS, {estimationPrepareTime: 'max'}))
            .to.be.equal(DEMAND_RATE * PREPARE_MAX_TIME + RESERVE_VOLUME);
    });

    it('should allow to define custom prepare time estimator', () => {
        const estimationPrepareTime = ({avg, max}) => (avg + max) / 2;
        expect(estimateBufferLength(PROCESS_STATS, {estimationPrepareTime}))
            .to.be.equal(DEMAND_RATE * estimationPrepareTime(PREPARE_TIME) + RESERVE_VOLUME);
    });

    it('should allow to define custom reserve factor', () => {
        const estimationReserveFactor = 5;
        expect(estimateBufferLength(PROCESS_STATS, {estimationReserveFactor}))
            .to.be.equal(DEMAND_RATE * PREPARE_AVG_TIME * estimationReserveFactor + RESERVE_VOLUME);
    });

    it('should allow to define custom reserve volume', () => {
        const estimationReserveVolume = 10;
        expect(estimateBufferLength(PROCESS_STATS, {estimationReserveVolume}))
            .to.be.equal(DEMAND_RATE * PREPARE_AVG_TIME + estimationReserveVolume);
    });
});
