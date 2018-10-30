function iteratorTest(iteratorFactory, sourceFactory, nonCompatibleValue) {
    it('should produce iterator', () => {
        const iterator = iteratorFactory(sourceFactory([]));
        expect(iterator).to.be.instanceof(Object);
        expect(iterator.next).to.be.instanceof(Function);
    });

    it('should iterate over factory sequence', async () => {
        const secuence = [1, 2, 3];
        const iterator = iteratorFactory(sourceFactory(secuence));

        let result = [];
        while(({done, value} = await iterator.next()), !done) {
            result = [...result, value];
        }

        expect(result).to.be.deep.equal(secuence);
    });

    it('should not produce iterator for non compatible source', () => {
        const iterator = iteratorFactory(nonCompatibleValue);
        expect(Boolean(iterator)).to.be.equal(false);
    });

    it.skip('should be used to reate appropriate iterator for WipPool', () => {
        // TODO
    })
}

module.exports = {
    iteratorTest
};
