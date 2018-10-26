const {WipPool, WipDone} = require('../../lib');

const DONE_RESULT = {
    done: true,
    value: undefined
};

describe('lib/WipPool', () => {
    it('should be a WipPool class', () => {
        expect(WipPool).to.have.property('prototype');
        expect(WipPool.prototype.constructor, 'constructor').to.be.equal(WipPool);
        expect(WipPool.name, 'class name').to.be.equal('WipPool');
    });

    it('should return WipPool instance if called with no new operator', () => {
        expect(WipPool()).to.be.instanceof(WipPool);
    });

    describe('iteration', () => {
        it.skip('should iterate over async generator', async () => {
            // TODO
        });

        it('should iterate over iterable', async () => {
            const source = [1, 2];
            const pool = WipPool(source);

            const result = await Promise.all([
                pool.next(),
                pool.next()
            ]);

            expect(result).to.be.deep.equal([
                {value: 1, done: false},
                {value: 2, done: false}
            ]);
        });

        it('should iterate over iterator', async () => {
            let value = 0;

            const pool = WipPool({
                next() {
                    value += 1;
                    return {value, done: false}
                }
            });

            const result = await Promise.all([
                pool.next(),
                pool.next()
            ]);

            expect(result).to.be.deep.equal([
                {value: 1, done: false},
                {value: 2, done: false}
            ]);
        });

        it('should iterate with factory function', async () => {
            const source = [1, 2];
            const pool = WipPool(() => {
                if (!source.length) {
                    throw new WipDone();
                }
                return source.splice(0, 1)[0];
            });
            const result = await Promise.all([
                pool.next(),
                pool.next()
            ]);

            expect(result).to.be.deep.equal([
                {value: 1, done: false},
                {value: 2, done: false}
            ]);
        });
    });

    describe('WipDone', () => {
        it.skip('should handle WipDone on async generator', async () => {
            // TODO
        });

        it('should handle WipDone on nothing', async () => {
            const pool = WipPool()
            const result = pool.next();

            expect(result).to.be.deep.equal(DONE_RESULT);
        });

        it('should handle WipDone on iterator', async () => {
            const source = [];
            const pool = WipPool({next(){ return DONE_RESULT}})
            const result = pool.next();

            expect(result).to.be.deep.equal(DONE_RESULT);
        });


        it('should handle WipDone on iterable', async () => {
            const source = [];
            const pool = WipPool(source)
            const result = pool.next();

            expect(result).to.be.deep.equal(DONE_RESULT);
        });

        it('should iteret with resolve function', async () => {
            const pool = WipPool(() => {throw new WipDone();});
            const result = await pool.next();

            expect(result).to.be.deep.equal(DONE_RESULT);
        });
    });

});
