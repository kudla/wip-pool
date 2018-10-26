const {WipError} = require('./WipError');

class WipDone extends WipError {
    constructor(message = 'WIP Pool is empty') {
        super(message);
    }
}

module.exports = {
    WipDone
};
