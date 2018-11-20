
export const completeConstruction = ({constructionQueue, demands, doneCount}) => constructionOrder => {

    const doneOrder = doneCount;
    const doneTime = Date.now();

    function updateDone(construction) {
        return construction.constructionOrder === constructionOrder
            ? {
                ...construction,
                doneOrder,
                doneTime
            }
            : construction
    }

    // const expired = Date.now - 5000;
    // const archives = demands
    //     .map(({doneTime, doneOrder}, index) => (doneTime < expired || doneOrder + 20 < doneCount) && index)
    //     .filter(index => typeof index === 'number');

    // archives
    //     .reverse()
    //     .forEach(index => demands.splice(index, 1))

    return {
        constructionQueue: constructionQueue.map(updateDone),
        demands: demands.map(updateDone),
        doneCount: doneCount + 1
    };
};
