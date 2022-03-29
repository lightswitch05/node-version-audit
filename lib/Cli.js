const { InvalidArgumentException, InvalidVersionException, StaleRulesException } = require('./Exceptions');
const { EOL } = require('os');
const util = require('util');
const { NodeVersionAudit } = require('./NodeVersionAudit');
const { Args, ARG_OPTIONS } = require('./Args');
const { SUPPORT_TYPE } = require('./SupportSchedule');

const Cli = {};

const EXIT_CODES = {
    FAIL_SECURITY: 10,
    FAIL_SUPPORT: 20,
    FAIL_PATCH: 30,
    FAIL_LATEST: 40,
    FAIL_STALE: 100,
    INVALID_ARG: 110,
    INVALID_VERSION: 120,
};

/**
 * @param args
 * @return {Promise<AuditResults>}
 */
Cli.run = async function (args) {
    console.debug(args);
    if (args[ARG_OPTIONS.HELP]) {
        showHelp();
        process.exit(0);
    }

    let app;
    try {
        app = new NodeVersionAudit(args[ARG_OPTIONS.NODE_VERSION], !args[ARG_OPTIONS.NO_UPDATE]);
    } catch (e) {
        if (e instanceof InvalidVersionException) {
            showHelp();
            process.exit(EXIT_CODES.INVALID_VERSION);
        }
    }

    if (args[ARG_OPTIONS.FULL_UPDATE]) {
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
        setExitCode(args, auditDetails);
        return auditDetails;
    } catch (e) {
        if (e instanceof StaleRulesException) {
            process.exit(EXIT_CODES.FAIL_STALE);
        }
        console.error(e);
    }
};

/**
 * @param {Args} args
 * @param {AuditResults} auditResults
 */
function setExitCode(args, auditResults) {
    if (args[ARG_OPTIONS.FAIL_SECURITY] && (auditResults.hasVulnerabilities() || !auditResults.hasSupport())) {
        process.exitCode = EXIT_CODES.FAIL_SECURITY;
    } else if (
        args[ARG_OPTIONS.FAIL_SUPPORT] &&
        (!auditResults.hasSupport() || ![SUPPORT_TYPE.CURRENT, SUPPORT_TYPE.ACTIVE].includes(auditResults.supportType))
    ) {
        process.exitCode = EXIT_CODES.FAIL_SUPPORT;
    } else if (args[ARG_OPTIONS.FAIL_LATEST] && !auditResults.isLatestVersion()) {
        process.exitCode = EXIT_CODES.FAIL_LATEST;
    } else if (args[ARG_OPTIONS.FAIL_PATCH] && !auditResults.isLatestPatchVersion()) {
        process.exitCode = EXIT_CODES.FAIL_PATCH;
    }
}

function parseArgs() {
    const args = new Args();

    for (let i = 2; i < process.argv.length; i++) {
        let arg = process.argv[i];
        if (!arg.startsWith('--')) {
            throw InvalidArgumentException.fromString(`Invalid argument: '${arg}'`);
        }
        arg = arg.replace('--', '');

        if (arg.startsWith(ARG_OPTIONS.NODE_VERSION)) {
            const split = arg.split('=');
            args[ARG_OPTIONS.NODE_VERSION] = split.length > 1 ? split[1] : null;
            continue;
        }

        if (arg in Args) {
            args[arg] = true;
            continue;
        }
        throw InvalidArgumentException.fromString(`Invalid argument: '${arg}'`);
    }

    if (!args[ARG_OPTIONS.NODE_VERSION]) {
        if (process.env.REQUIRE_VERSION_ARG === 'true') {
            throw InvalidArgumentException.fromString('Missing required argument: --version');
        }
        args[ARG_OPTIONS.NODE_VERSION] = process.versions.node;
    }

    return args;
}

function showHelp() {
    const usageMask = `\t\t\t\t[--%s] [--%s]${EOL}`;
    const argsMask = `--%s\t\t\t%s${EOL}`;
    const argsErrorCodeMask = `--%s\t\t\tgenerate a %s %s${EOL}`;
    let out = util.format(`%s${EOL}`, 'Node Version Audit');
    out += util.format(
        `%s\t%s${EOL}`,
        'usage: node-version-audit',
        `[--help] [--${ARG_OPTIONS.NODE_VERSION}=NODE_VERSION]`
    );
    out += util.format(usageMask, ARG_OPTIONS.FAIL_SECURITY, ARG_OPTIONS.FAIL_SUPPORT);
    out += util.format(usageMask, ARG_OPTIONS.FAIL_PATCH, ARG_OPTIONS.FAIL_LATEST);
    out += util.format(usageMask, ARG_OPTIONS.NO_UPDATE, 'silent');
    out += util.format(`\t\t\t\t[--%s]${EOL}`, 'v');
    out += util.format(`%s${EOL}`, 'optional arguments:');
    out += util.format(argsMask, ARG_OPTIONS.HELP, '\tshow this help message and exit.');
    out += util.format(
        argsMask,
        ARG_OPTIONS.NODE_VERSION,
        'set the Node Version to run against. Defaults to the runtime version. This is required when running with docker.'
    );
    out += util.format(
        argsErrorCodeMask,
        ARG_OPTIONS.FAIL_SECURITY,
        EXIT_CODES.FAIL_SECURITY,
        'exit code if any CVEs are found, or security support has ended.'
    );
    out += util.format(
        argsErrorCodeMask,
        ARG_OPTIONS.FAIL_SUPPORT,
        EXIT_CODES.FAIL_SUPPORT,
        'exit code if the version of Node no longer gets active (bug) support.'
    );
    out += util.format(
        argsErrorCodeMask,
        ARG_OPTIONS.FAIL_PATCH,
        EXIT_CODES.FAIL_PATCH,
        'exit code if there is a newer patch-level release.'
    );
    out += util.format(
        argsErrorCodeMask,
        ARG_OPTIONS.FAIL_LATEST,
        EXIT_CODES.FAIL_LATEST,
        'exit code if there is a newer release.'
    );
    out += util.format(argsMask, ARG_OPTIONS.NO_UPDATE, 'do not download the latest rules. NOT RECOMMENDED!');
    out += util.format(argsMask, 'silent', 'do not write any error messages to STDERR.');
    out += util.format(
        argsMask,
        'v',
        '\tSet verbosity. v=warnings, vv=info, vvv=debug. Default is error. All logging writes to STDERR.'
    );
    console.info(out);
}

if (require.main === module) {
    const args = parseArgs();
    Cli.run(args).then((result) => {
        console.log(JSON.stringify(result, null, 4));
    });
}

module.exports = {
    Cli,
    parseArgs,
};
