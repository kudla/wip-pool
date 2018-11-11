function estimateDemandDelay(processMetrics) {
    const {
        prepareLack,
        prepareInterval
    } = processMetrics;

    return prepareLack && Math.ceil((1 - Math.ceil(prepareLack)) * prepareInterval);
}

module.exports = {
    estimateDemandDelay
};
