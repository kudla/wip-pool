const {fromNothing} = require('../../../lib/iterators');

describe('lib/iterators/fromNothing', () => {
    it('should create iterator', () => {
        const iterator = fromNothing();
        expect(iterator).to.be.instanceof(Object);
        expect(iterator.next).to.be.instanceof(Function);
    });

    it('should create exhausted iterator', () => {
        const iterator = fromNothing();
        expect(iterator.next()).to.be.deep.equal({done: true, value: undefined});
    });
});