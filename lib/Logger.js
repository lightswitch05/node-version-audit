let verbosity;

function Logger() {
    // simple constructor
}

Logger.SILENT = 0;
Logger.ERROR = 1;
Logger.WARNING = 2;
Logger.INFO = 3;
Logger.DEBUG = 4;

/**
 * @param {number} newVerbosity
 */
Logger.setVerbosity = function (newVerbosity) {
    verbosity = newVerbosity;
};

/**
 * @param {...*} logMessages
 */
Logger.error = function (...logMessages) {
    log(Logger.ERROR, 'error', logMessages);
};

/**
 * @param {...*} logMessages
 */
Logger.warning = function (...logMessages) {
    log(Logger.WARNING, 'warning', logMessages);
};

/**
 * @param {...*} logMessages
 */
Logger.info = function (...logMessages) {
    log(Logger.INFO, 'info', logMessages);
};

/**
 * @param {...*} logMessages
 */
Logger.debug = function (...logMessages) {
    log(Logger.DEBUG, 'debug', logMessages);
};

/**
 * @return {number}
 */
Logger.getVerbosity = function () {
    if (verbosity || verbosity === 0) {
        return verbosity;
    }
    return Logger.ERROR;
};

/**
 * @param {number} levelCode
 * @param {string} levelName
 * @param {[*]} logArgs
 */
function log(levelCode, levelName, logArgs) {
    if (Logger.getVerbosity() < levelCode) {
        return;
    }
    const logEvent = {
        level: levelName,
        time: new Date().toISOString(),
        logMessage: '',
    };

    for (const logArg of logArgs) {
        if (typeof logArg === 'string') {
            logEvent.logMessage += logArg;
        } else if (logArg instanceof Error) {
            logEvent.logMessage += logArg.message;
        } else {
            logEvent.logMessage += JSON.stringify(logArg, null, 4);
        }
    }

    console.error(JSON.stringify(logEvent, null, 4));
}

module.exports = {
    Logger,
};
