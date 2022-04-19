const { Logger } = require('./Logger');
const { InvalidArgumentException, InvalidVersionException } = require('./Exceptions');

function Args() {
    // simple constructor
}

/**
 * @return {number}
 */
Args.prototype.getVerbosity = function () {
    if (this[Args.OPTIONS.V_DEBUG]) {
        return Logger.DEBUG;
    }
    if (this[Args.OPTIONS.V_INFO]) {
        return Logger.INFO;
    }
    if (this[Args.OPTIONS.V_WARNING]) {
        return Logger.WARNING;
    }
    if (this[Args.OPTIONS.SILENT]) {
        return Logger.SILENT;
    }
    return Logger.ERROR;
};

Args.OPTIONS = {
    NODE_VERSION: 'version',
    HELP: 'help',
    NO_UPDATE: 'no-update',
    FULL_UPDATE: 'full-update',
    FAIL_SECURITY: 'fail-security',
    FAIL_SUPPORT: 'fail-support',
    FAIL_PATCH: 'fail-patch',
    FAIL_MINOR: 'fail-minor',
    FAIL_LATEST: 'fail-latest',
    SILENT: 'silent',
    V_WARNING: 'v',
    V_INFO: 'vv',
    V_DEBUG: 'vvv',
};

Args[Args.OPTIONS.NODE_VERSION] = null;
Args[Args.OPTIONS.HELP] = false;
Args[Args.OPTIONS.NO_UPDATE] = false;
Args[Args.OPTIONS.FULL_UPDATE] = false;
Args[Args.OPTIONS.FAIL_SECURITY] = false;
Args[Args.OPTIONS.FAIL_SUPPORT] = false;
Args[Args.OPTIONS.FAIL_PATCH] = false;
Args[Args.OPTIONS.FAIL_MINOR] = false;
Args[Args.OPTIONS.FAIL_LATEST] = false;
Args[Args.OPTIONS.SILENT] = false;
Args[Args.OPTIONS.V_WARNING] = false;
Args[Args.OPTIONS.V_INFO] = false;
Args[Args.OPTIONS.V_DEBUG] = false;

/**
 * @param {string[]} argv
 * @return {Args}
 */
Args.parseArgs = function (argv) {
    const args = new Args();

    for (let i = 2; i < argv.length; i++) {
        let arg = argv[i];
        if (!arg.startsWith('--')) {
            throw InvalidArgumentException.fromString(`Invalid argument: '${arg}'`);
        }
        arg = arg.replace('--', '');

        if (arg.startsWith(Args.OPTIONS.NODE_VERSION)) {
            const split = arg.split('=');
            if (split.length !== 2 || !split[1] || split[1].length < 5) {
                throw InvalidArgumentException.fromString(`Version arg must be in format --version=1.2.3`);
            }
            args[Args.OPTIONS.NODE_VERSION] = split[1];
            continue;
        }

        if (arg in Args) {
            args[arg] = true;
            continue;
        }
        throw InvalidArgumentException.fromString(`Invalid argument: '${arg}'`);
    }

    if (!args[Args.OPTIONS.NODE_VERSION]) {
        if (process.env.NVA_REQUIRE_VERSION_ARG === 'true') {
            throw InvalidArgumentException.fromString('Missing required argument: --version');
        }
        args[Args.OPTIONS.NODE_VERSION] = process.versions.node;
    }

    return args;
};

module.exports = {
    Args,
};
