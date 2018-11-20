export const addWip = ({constructionQueue, wipCount}) => (wip, resolve, prepareTime) => {
    const start = Date.now();
    const constructionOrder = wipCount;


    function completeConstruction() {
        resolve(constructionOrder);
    }

    setTimeout(completeConstruction, prepareTime);

    const wipConstruction = {
        constructionOrder,
        wip,
        start,
        prepareTime,
        completeConstruction
    };

    return {
        wipCount: wipCount + 1,
        constructionQueue: [
            ...constructionQueue,
            wipConstruction
        ]
    };
};