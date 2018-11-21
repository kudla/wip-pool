const {WipDoneError} = require('../errors');
const {
    fromAsyncGenerator,
    fromIterable,
    fromIterator,
    fromFactory,
    fromNothing
} = require('../iterators');
const {SignalHistory} = require('../SignalHistory');
const {SignalAggregator} = require('../SignalAggregator');
const {calculateProcessMetrics} = require('./planning/calculateProcessMetrics');
const {estimateWipLack} = require('./planning/estimateWipLack');
const {estimateDemandDelay} = require('./planning/estimateDemandDelay');


const iteratorFactories = [
    fromAsyncGenerator,
    fromIterable,
    fromIterator,
    fromFactory,
    fromNothing
];

const DEFAULT_DEMAND_INTERVAL = Infinity;
const DEFAULT_PREPARE_TIME = 0;

function WipPool(source, options = {}) {
    if (!(this instanceof WipPool)) {
        return new WipPool(source, options);
    }

    const iterator = iteratorFactories
        .reduce((found, factory) => found || factory(source), false);

    const {
        demandHistoryLength,
        demandTimeWindow,
        initialDemandInterval = DEFAULT_DEMAND_INTERVAL,
        initialPrepareInterval = DEFAULT_PREPARE_TIME
    } = options;

    const demandHistory = new SignalHistory({
        historyLength: demandHistoryLength,
        timeWindow: demandTimeWindow
    });

    const prepareHistory = new SignalHistory();

    const wipBuffer = [];
    const inProgress = [];

    Object.assign(
        this,
        {
            iterator,
            demandHistory,
            prepareHistory,
            wipBuffer,
            inProgress,
            options,
            initialDemandInterval: new SignalAggregator(initialDemandInterval),
            initialPrepareInterval
        }
    );
}

const bufferSortProps = ['prepared', 'index']
    .map(propName => object => (
        propName in object
            ? object[propName]
            : Number.NEGATIVE_INFINITY
    ));

const wipBufferComparator = (a, b) => bufferSortProps
    .reduce((compared, compareProp) => compared || compareProp(a) - compareProp(b), 0);

Object.assign(
    WipPool.prototype,
    {
        nextWIP() {
            return this.next()
                .then(({value, done}) => (done
                    ? Promise.reject(new WipDoneError())
                    : value)
                );
        },

        getStats() {
            const now = Date.now();

            const {demandHistory, inProgress, initialDemandInterval, initialPrepareInterval} = this;
            const demandInterval = demandHistory.stats.count
                ? demandHistory.stats
                : initialDemandInterval;

            const [inProgressTime] = inProgress
                .slice(0, 1)
                .map(({start}) => now - start);

            const nonHistoricalPrepare = inProgressTime === undefined
                ? initialPrepareInterval
                : inProgressTime;

            const prepareHistory = this.prepareHistory.stats.count
                ? this.prepareHistory.stats
                : new SignalAggregator(nonHistoricalPrepare);

            const prepareInterval = {
                avg: prepareHistory.avg,
                min: Number(prepareHistory.min),
                max: Number(prepareHistory.max)
            };

            const lastDemandInterval = demandHistory.time.max;

            const demandIdle = now - (lastDemandInterval || now);
            const demandIntervalWithLatencyCorrection = demandIdle > demandInterval.avg
                ? new SignalAggregator(demandInterval, demandIdle)
                : demandInterval;

            return {
                demandInterval: demandIntervalWithLatencyCorrection,
                prepareInterval,
                lastDemandInterval,
                demandIdle
            };
        },

        sortBuffer() {
            const {wipBuffer} = this;
            wipBuffer.sort(wipBufferComparator);
        },

        updatePrepareHistory(progress) {
            const {start} = progress;
            const {prepareHistory, inProgress} = this;
            prepareHistory.addSignals(Date.now() - start);
            const progressIndex = inProgress.indexOf(progress);
            inProgress.splice(progressIndex, 1);
        },

        updateWipBuffer(progress) {
            const now = Date.now();
            const {wipBuffer} = this;

            Object.assign(progress, {prepared: now});

            if (wipBuffer.includes(progress)) {
                this.sortBuffer();
            }

            this.scheduleForecast();
        },

        scheduleForecast(demanded = 0) {
            const {nextForecast, options} = this;

            clearTimeout(nextForecast);
            delete this.nextForecast;

            const stats = this.getStats();
            const processMetrics = calculateProcessMetrics(stats, options);

            this.updateBufferLength(processMetrics, demanded);

            const demandDelay = estimateDemandDelay(processMetrics);

            if (demandDelay) {
                this.nextForecast = setTimeout(() => {
                    this.scheduleForecast();
                }, demandDelay);
            }
        },

        updateBufferLength(processMetrics, demanded) {
            const {options, wipBuffer} = this;

            const estimatedWipLack = Math.ceil(estimateWipLack(processMetrics, options) + demanded);
            const readyVolume = wipBuffer.length;

            const lackVolume = estimatedWipLack - readyVolume;

            if (lackVolume > 0) {
                this.wipBuffer = [...new Array(lackVolume)]
                    .map(() => this.prepareBufferItem())
                    .reverse()
                    .concat(wipBuffer);
            }
        },

        prepareWip() {
            const start = Date.now();
            const {iterator, inProgress, wipCount} = this;
            this.wipCount += 1;
            const progress = {
                start,
                index: wipCount,
                wip: iterator
                    .next()
                    .then((value) => {
                        this.updatePrepareHistory(progress);
                        return value;
                    })
            };
            inProgress.push(progress);
            return progress;
        },

        prepareBufferItem() {
            const progress = this.prepareWip();
            const {wip} = progress;
            progress.bufferWip = wip
                .then(() => this.updateWipBuffer(progress))
                .then(() => wip);

            return progress;
        },

        consumeWip() {
            const {wip} = this.wipBuffer.pop();
            return wip;
        },

        next() {
            const {demandHistory, firstDemand} = this;
            const now = Date.now();
            if (demandHistory.stats.count) {
                demandHistory.addSignals(now - demandHistory.time.max);
            } else if (firstDemand !== undefined) {
                demandHistory.addSignals(now - firstDemand);
                delete this.firstDemand;
            } else {
                this.firstDemand = now;
            }

            this.scheduleForecast(1);
            return this.consumeWip();
        }
    }
);


module.exports = {
    WipPool
};
