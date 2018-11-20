export const wipFactory = ({addWip, getWipPrepareTime, completeConstruction, utilizeWip}) => () => {
    const prepareTime = getWipPrepareTime();
    let resolvePromise;
    const wip = new Promise(resolve => (resolvePromise = resolve));

    addWip(wip, resolvePromise, prepareTime);
    wip
        .then(completeConstruction)
        .then(utilizeWip);

    return wip;
};