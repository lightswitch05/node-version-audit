const {
    InvalidArgumentException,
    InvalidVersionException,
    StaleRulesException,
    DownloadException,
    InvalidRuntimeException,
} = require('./Exceptions');
const { EOL } = require('os');
const util = require('util');
const { NodeVersionAudit } = require('./NodeVersionAudit');
const { Args } = require('./Args');
const { SUPPORT_TYPE } = require('./SupportSchedule');
const { Logger } = require('./Logger');

const EXIT_CODES = {
    FAIL_SECURITY: 10,
    FAIL_SUPPORT: 20,
    FAIL_PATCH: 30,
    FAIL_MINOR: 40,
    FAIL_LATEST: 50,
    FAIL_STALE: 100,
    INVALID_ARG: 110,
    INVALID_VERSION: 120,
    INVALID_RUNTIME: 130,
};

/**
 * @param {string[]} argv
 * @constructor
 */
function Cli(argv) {
    try {
        this.args = Args.parseArgs(argv);
        Logger.setVerbosity(this.args.getVerbosity());
    } catch (e) {
        if (e instanceof InvalidArgumentException) {
            Cli.showHelp();
            Logger.error(e);
            process.exit(EXIT_CODES.INVALID_ARG);
        }
        if (e instanceof DownloadException) {
            Logger.error(e);
            process.exit(EXIT_CODES.FAIL_STALE);
        }
        throw e;
    }
}

/**
 * @return {Promise<AuditResults>}
 */
Cli.prototype.run = async function () {
    if (this.args[Args.OPTIONS.HELP]) {
        Cli.showHelp();
        return process.exit(0);
    }

    let app;
    try {
        app = new NodeVersionAudit(this.args[Args.OPTIONS.NODE_VERSION], !this.args[Args.OPTIONS.NO_UPDATE]);
    } catch (e) {
        if (e instanceof InvalidVersionException) {
            Logger.error(e);
            Cli.showHelp();
            return process.exit(EXIT_CODES.INVALID_VERSION);
        }
        if (e instanceof InvalidRuntimeException) {
            Logger.error(e);
            return process.exit(EXIT_CODES.INVALID_RUNTIME);
        }
        throw e;
    }

    if (this.args[Args.OPTIONS.FULL_UPDATE]) {
        /**
         * PLEASE DO NOT USE THIS. This function is intended to only be used internally for updating
         * project rules in github, which can then be accessed by ALL instances of Node Version Audit.
         * Running it locally puts unnecessary load on the source servers and cannot be re-used by others.
         *
         * The github hosted rules are setup on a cron schedule to update regularly.
         * Running it directly will not provide you with any new information and will only
         * waste time and server resources.
         */
        await app.fullRulesUpdate();
    }

    try {
        const auditDetails = await app.getAllAuditResults();
        console.log(JSON.stringify(auditDetails, null, 4));
        this.setExitCode(auditDetails);
        return auditDetails;
    } catch (e) {
        if (e instanceof StaleRulesException) {
            Logger.error('Rules are stale: ', e);
            return process.exit(EXIT_CODES.FAIL_STALE);
        }
        Logger.error(e);
    }
};

/**
 * @param {AuditResults} auditResults
 */
Cli.prototype.setExitCode = function (auditResults) {
    if (this.args[Args.OPTIONS.FAIL_SECURITY] && (auditResults.hasVulnerabilities() || !auditResults.hasSupport())) {
        process.exitCode = EXIT_CODES.FAIL_SECURITY;
    } else if (
        this.args[Args.OPTIONS.FAIL_SUPPORT] &&
        (!auditResults.hasSupport() || ![SUPPORT_TYPE.CURRENT, SUPPORT_TYPE.ACTIVE].includes(auditResults.supportType))
    ) {
        process.exitCode = EXIT_CODES.FAIL_SUPPORT;
    } else if (this.args[Args.OPTIONS.FAIL_LATEST] && !auditResults.isLatestVersion()) {
        process.exitCode = EXIT_CODES.FAIL_LATEST;
    } else if (this.args[Args.OPTIONS.FAIL_MINOR] && !auditResults.isLatestMinorVersion()) {
        process.exitCode = EXIT_CODES.FAIL_MINOR;
    } else if (this.args[Args.OPTIONS.FAIL_PATCH] && !auditResults.isLatestPatchVersion()) {
        process.exitCode = EXIT_CODES.FAIL_PATCH;
    }
};

Cli.showHelp = function () {
    const usageMask = `\t\t\t\t[--%s] [--%s]${EOL}`;
    const argsMask = `--%s\t\t\t%s${EOL}`;
    const argsErrorCodeMask = `--%s\t\t\tgenerate a %s %s${EOL}`;
    let out = util.format(`%s${EOL}`, 'Node Version Audit');
    out += util.format(
        `%s\t%s${EOL}`,
        'usage: node-version-audit',
        `[--help] [--${Args.OPTIONS.NODE_VERSION}=NODE_VERSION]`
    );
    out += util.format(usageMask, Args.OPTIONS.FAIL_SECURITY, Args.OPTIONS.FAIL_SUPPORT);
    out += util.format(usageMask, Args.OPTIONS.FAIL_PATCH, Args.OPTIONS.FAIL_LATEST);
    out += util.format(usageMask, Args.OPTIONS.NO_UPDATE, 'silent');
    out += util.format(`\t\t\t\t[--%s]${EOL}`, 'v');
    out += util.format(`%s${EOL}`, 'optional arguments:');
    out += util.format(argsMask, Args.OPTIONS.HELP, '\tshow this help message and exit.');
    out += util.format(
        argsMask,
        Args.OPTIONS.NODE_VERSION,
        'set the Node Version to run against. Defaults to the runtime version. This is required when running with docker.'
    );
    out += util.format(
        argsErrorCodeMask,
        Args.OPTIONS.FAIL_SECURITY,
        EXIT_CODES.FAIL_SECURITY,
        'exit code if any CVEs are found, or security support has ended.'
    );
    out += util.format(
        argsErrorCodeMask,
        Args.OPTIONS.FAIL_SUPPORT,
        EXIT_CODES.FAIL_SUPPORT,
        'exit code if the version of Node no longer gets active (bug) support.'
    );
    out += util.format(
        argsErrorCodeMask,
        Args.OPTIONS.FAIL_PATCH,
        EXIT_CODES.FAIL_PATCH,
        'exit code if there is a newer patch-level release.'
    );
    out += util.format(
        argsErrorCodeMask,
        Args.OPTIONS.FAIL_MINOR,
        EXIT_CODES.FAIL_MINOR,
        'exit code if there is a newer minor-level release.'
    );
    out += util.format(
        argsErrorCodeMask,
        Args.OPTIONS.FAIL_LATEST,
        EXIT_CODES.FAIL_LATEST,
        'exit code if there is a newer release.'
    );
    out += util.format(argsMask, Args.OPTIONS.NO_UPDATE, 'do not download the latest rules. NOT RECOMMENDED!');
    out += util.format(argsMask, 'silent', 'do not write any error messages to STDERR.');
    out += util.format(
        argsMask,
        'v',
        '\tSet verbosity. v=warnings, vv=info, vvv=debug. Default is error. All logging writes to STDERR.'
    );
    console.info(out);
};

module.exports = {
    Cli,
};
