export const utilizeWip = ({demands, usedCount}) => () => {
    let nextUsedCount = usedCount;
    function utilize(construction) {
        const {
            doneOrder,
            expire
        } = construction;

        if (doneOrder !== undefined && expire === undefined) {
            const expire = Date.now() + 3000;
            const utilizedOrder = nextUsedCount;
            nextUsedCount += 1;
            return {
                ...construction,
                expire,
                utilizedOrder
            }
        }
        return construction;
    }
    return {
        demands: demands.map(utilize),
        usedCount: nextUsedCount
    };
};
