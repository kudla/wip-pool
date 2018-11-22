function shouldComplete({releaseTime, doneOrder}) {
    const {now} = this;
    return doneOrder === undefined && releaseTime < now;
}

function processConstruction(construction) {
    const {doneCount, now} = this;

    if (shouldComplete.call(this, construction)) {
        const doneOrder = doneCount;
        const doneTime = now;
        this.doneCount += 1;
        construction.complete();
        return {
            ...construction,
            doneOrder,
            doneTime,
            progress: undefined
        };
    }
    if (construction.doneOrder === undefined) {
        const {
            start,
            prepareTime
        }  = construction;
        return {
            ...construction,
            progress: `${100 *(now - start) / (prepareTime || 1)}%`
        };
    }
    return construction;
}

export const processConstructions = ({lastProcessing, demands, constructionQueue, doneCount}) => (tick) => {
    const context = {
        now: Date.now(),
        doneCount
    };

    const needUpdate  = (tick - lastProcessing) > 250
        || demands.some(shouldComplete, context)
        || constructionQueue.some(shouldComplete, context);

    if (!needUpdate) {
        return;
    }

    return {
        lastProcessing: tick,
        demands: demands.map(processConstruction, context),
        constructionQueue: constructionQueue.map(processConstruction, context),
        doneCount: context.doneCount
    };
};