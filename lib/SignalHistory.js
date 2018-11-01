const {SignalAggregator} = require('./SignalAggregator');

const DEFAULT_LENGTH_LIMIT = 64;
const DEFAULT_TIME_WINDOW = null;

class SignalHistory {
    constructor(options = {}) {
        const {
            lengthLimit = DEFAULT_LENGTH_LIMIT,
            timeWindow = DEFAULT_TIME_WINDOW
        } = options;
        const stats = new SignalAggregator();
        Object.assign(
            this,
            {
                lengthLimit,
                timeWindow,
                stats,
                history: (
                    typeof lengthLimit === 'number' ||
                    typeof timeWindow === 'number'
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
            const {stats, history: currentHistory, lengthLimit, timeWindow} = this;
            if (currentHistory) {
                const time = Date.now();
                const expired = typeof timeWindow === 'number'
                    ? time - timeWindow
                    : undefined;

                const history = currentHistory
                    .concat(
                        influentSignals
                            .map(signal => ({
                                signal,
                                time
                            }))
                    ).slice(-lengthLimit)
                    .filter(({time}) => !(time < expired));

                Object.assign(this, {
                    history,
                    stats: new SignalAggregator(
                        ...history
                            .map(({signal}) => signal)
                    )
                });
                return;
            }

            stats.addSignals(...signals);
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
