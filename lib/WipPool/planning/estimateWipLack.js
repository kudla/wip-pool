function estimateWipLack(processMetrics) {
    const {
        reserveFactor,
        reserveVolume,
        prepareLack
    } = processMetrics;

    const estimatedLack = prepareLack
        ? prepareLack * reserveFactor
        : 0;

    return estimatedLack + reserveVolume;
}

module.exports = {
    estimateWipLack
};
