const emptyIterator = {
    next() {
        return {
            value: undefined,
            done: true
        };
    }
};

function fromNothing() {
    return emptyIterator;
}

module.exports = {
    fromNothing
};
