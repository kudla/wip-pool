
export const completeConstruction = ({constructionQueue, demands, doneCount}) => constructionOrder => {


    function updateDone(construction) {
        if (construction.constructionOrder === constructionOrder) {
            const doneOrder = doneCount;
            const doneTime = Date.now();
            doneCount += 1;
            construction.complete();
            return  {
                ...construction,
                doneOrder,
                doneTime,
                progress: undefined
            }
        };
        return construction;
    }

    return {
        constructionQueue: constructionQueue.map(updateDone),
        demands: demands.map(updateDone),
        doneCount
    };
};
