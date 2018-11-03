function iteratorTest(iteratorFactory, sourceFactory, nonCompatibleValue) {
    it('should produce iterator', () => {
        const iterator = iteratorFactory(sourceFactory([]));
        expect(iterator).to.be.instanceof(Object);
        expect(iterator.next).to.be.instanceof(Function);
    });

    it('should iterate over factory sequence', async () => {
        const sequence = [1, 2, 3];
        const iterator = iteratorFactory(sourceFactory(sequence));

        let result = [];
        let done;
        let value;
        // eslint-disable-next-line no-await-in-loop, no-cond-assign
        while (({done, value} = await iterator.next())) {
            if (done) {
                break;
            }
            result = [...result, value];
        }

        expect(result).to.be.deep.equal(sequence);
    });

    it('should not produce iterator for non compatible source', () => {
        const iterator = iteratorFactory(nonCompatibleValue);
        expect(Boolean(iterator)).to.be.equal(false);
    });

    it.skip('should be used to rate appropriate iterator for WipPool', () => {
        // TODO
    });
}

module.exports = {
    iteratorTest
};
