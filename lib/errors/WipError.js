class WipError extends Error {
    constructor(message) {
        super(message);
        this.code = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = {
    WipError
};
