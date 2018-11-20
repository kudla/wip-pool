export const getWipPrepareTime = ({avgWipPrepareTime, wipPrepareTimeDistribution}) => () => {
    const distributedValue = avgWipPrepareTime + wipPrepareTimeDistribution * (1 - 2 * Math.random());
    const wipPrepareTime = Math.max(0, Math.round(distributedValue)) || 0;

    return wipPrepareTime;
}