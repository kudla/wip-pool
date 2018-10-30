const {WipError} = require('./WipError');

class WipDoneError extends WipError {
    constructor(message = 'WIP Pool is empty') {
        super(message);
    }
}

module.exports = {
    WipDoneError
};
