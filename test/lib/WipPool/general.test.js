const {WipPool} = require('../../../lib');

describe('lib/WipPool:general', () => {
    it('should be a WipPool class', () => {
        expect(WipPool).to.have.property('prototype');
        expect(WipPool.prototype.constructor, 'constructor').to.be.equal(WipPool);
        expect(WipPool.name, 'class name').to.be.equal('WipPool');
    });

    it('should return WipPool instance if called with no new operator', () => {
        expect(WipPool()).to.be.instanceof(WipPool);
    });
});
