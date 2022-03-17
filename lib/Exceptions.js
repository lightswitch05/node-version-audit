class ParseException extends Error {
    /**
     * @param {string} message
     * @return {ParseException}
     */
    static fromString(message) {
        return new ParseException(message);
    }

    /**
     * @param {Error} exception
     */
    static fromException(exception) {
        return new ParseException(exception.message);
    }
}

class StaleRulesException extends Error {
    /**
     * @param {string} message
     * @return {StaleRulesException}
     */
    static fromString(message) {
        return new StaleRulesException(message);
    }
}

class InvalidArgumentException extends Error {
    /**
     * @param {string} message
     * @return {InvalidArgumentException}
     */
    static fromString(message) {
        return new InvalidArgumentException(message);
    }
}

class InvalidVersionException extends Error {
    /**
     * @param {?string} version
     * @return {InvalidVersionException}
     */
    static fromString(version) {
        return new InvalidVersionException(`NodeVersion [${version}] is not valid`);
    }
}

module.exports = {
    ParseException,
    StaleRulesException,
    InvalidArgumentException,
    InvalidVersionException,
};
