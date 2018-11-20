export const demandsGC = ({demands, usedCount}) => () => {
    const  now = Date.now();
    return {
        demands: demands
            .filter(({utilizedOrder, expire}) => !(utilizedOrder + 15 < usedCount || expire < now))
    };
};
