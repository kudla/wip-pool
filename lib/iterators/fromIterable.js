const iterableSymbol = typeof Symbol !== undefined
    ? Symbol.iterator
    : undefined;

function fromIterable(source) {
    const iterator = iterableSymbol && source && source[iterableSymbol];
    return iterator instanceof Function
        ? iterator.call(source)
        : false;
}

module.exports = {
    fromIterable
};
