function resolveGeneratorConstructor() {
    try {
        // eslint-disable-next-line no-eval
        return eval('(async function*(){}).constructor');
    } catch (error) {
        return new Error('No async generators support');
    }
}
const AsyncGeneratorFunction = resolveGeneratorConstructor();

function isAsyncGenerator(source) {
    return source && source.constructor === AsyncGeneratorFunction;
}

function fromAsyncGenerator(source) {
    return isAsyncGenerator(source) && source();
}

module.exports = {
    fromAsyncGenerator
};
