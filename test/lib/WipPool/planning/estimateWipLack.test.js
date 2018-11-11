const {estimateWipLack} = require('../../../../lib/WipPool/planning/estimateWipLack');


describe('lib/WipPool/planning/estimateWipLack', () => {
    it('should be a function', () => {
        expect(estimateWipLack).to.be.instanceof(Function);
    });

    it('should be reserveVolume on non demandInterval history', () => {
        const reserveVolume = 15;

        expect(estimateWipLack({
            demandInterval: 0,
            reserveVolume
        })).to.be.equal(reserveVolume);
    });

    it('should estimate wip lack on progress metrics', () => {
        const reserveFactor = 1.5;
        const reserveVolume = 3;
        const prepareLack = 7;

        expect(estimateWipLack({
            reserveFactor,
            reserveVolume,
            prepareLack
        })).to.be.equal(reserveFactor * prepareLack + reserveVolume);
    });
});
