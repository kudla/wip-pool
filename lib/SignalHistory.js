const {SignalAggregator} = require('./SignalAggregator');

const DEFAULT_LENGTH_LIMIT = 64;
const DEFAULT_TIME_WINDOW = null;

class SignalHistory {
    constructor(options = {}) {
        const {
            historyLength = DEFAULT_LENGTH_LIMIT,
            timeWindow = DEFAULT_TIME_WINDOW
        } = options;
        const stats = new SignalAggregator();
        const time = new SignalAggregator();
        Object.assign(
            this,
            {
                historyLength,
                timeWindow,
                stats,
                time,
                history: (
                    typeof historyLength === 'number'
                    || typeof timeWindow === 'number'
                )
                    ? []
                    : undefined
            }
        );
    }

    addSignals(...signals) {
        const influentSignals = signals
            .filter(signal => typeof signal === 'number');

        if (influentSignals.length) {
            const {stats, time, history: currentHistory, historyLength, timeWindow} = this;
            const now = Date.now();

            if (currentHistory) {
                const expired = typeof timeWindow === 'number'
                    ? now - timeWindow
                    : undefined;

                const history = currentHistory
                    .concat(
                        influentSignals
                            .map(signal => ({
                                signal,
                                time: now
                            }))
                    ).slice(-historyLength)
                    .filter(event => !(event.time < expired));

                Object.assign(this, {
                    history,
                    stats: new SignalAggregator(
                        ...history
                            .map(({signal}) => signal)
                    ),
                    time: new SignalAggregator(
                        ...history
                            .map(event => event.time)
                    )
                });
                return;
            }

            stats.addSignals(...signals);
            time.addSignals(...signals.map(() => now));
        }
    }
}

Object.assign(
    SignalHistory,
    {
        DEFAULT_LENGTH_LIMIT,
        DEFAULT_TIME_WINDOW
    }
);

module.exports = {
    SignalHistory
};
