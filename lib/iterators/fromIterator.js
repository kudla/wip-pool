function fromIterator(source) {
    const next = source && source.next;
    return next instanceof Function
        ? source
        : false;
}

module.exports = {
    fromIterator
};
