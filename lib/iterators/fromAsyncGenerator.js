const AsyncGeneratorFunction = (function () {
    try {
        return eval('(async function*(){}).constructor');
    } catch(error) {
        return new Error('No async generators support');
    }
})();

function isAsyncGenerator(source) {
    return source && source.constructor === AsyncGeneratorFunction;
}

function fromAsyncGenerator(source) {
    return isAsyncGenerator(source) && source();
}

module.exports = {
    fromAsyncGenerator
};
