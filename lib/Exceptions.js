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
     * @return {ParseException}
     */
    static fromException(exception) {
        return new ParseException(exception.message);
    }
}

class DownloadException extends Error {
    /**
     * @param {string} message
     * @return {DownloadException}
     */
    static fromString(message) {
        return new DownloadException(message);
    }

    /**
     * @param {Error} exception
     * @return {DownloadException}
     */
    static fromException(exception) {
        return new DownloadException(exception.message);
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
        return new InvalidVersionException(`Node.js version [${version}] is not valid`);
    }
}

class UnknownVersionException extends Error {
    /**
     * @param {?string} version
     * @return {UnknownVersionException}
     */
    static fromString(version) {
        return new UnknownVersionException(`Unknown Node.js version [${version}], perhaps rules are stale.`);
    }
}

class InvalidRuntimeException extends Error {
    /**
     * @param {NodeVersion} version
     * @returns {InvalidRuntimeException}
     */
    static fromVersion(version) {
        return new InvalidRuntimeException(
            `Node.js runtime ${version} is unsupported, please update the runtime Node.js version or use Docker.`,
        );
    }
}

module.exports = {
    ParseException,
    DownloadException,
    StaleRulesException,
    InvalidArgumentException,
    InvalidVersionException,
    UnknownVersionException,
    InvalidRuntimeException,
};
