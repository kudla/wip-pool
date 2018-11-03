const WipError = require('./WipError');
const WipDoneError = require('./WipDoneError');

Object.assign(
    module.exports,
    WipError,
    WipDoneError
);
