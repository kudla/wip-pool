const {WipPool} = require('../../lib/WipPool');

describe('lib/WipPool', () => {
    it('should be a WipPool class', () => {
        expect(WipPool).to.have.property('prototype');
        expect(WipPool.prototype.constructor, 'constructor').to.be.equal(WipPool);
        expect(WipPool.name, 'class name').to.be.equal('WipPool');
    });
});
