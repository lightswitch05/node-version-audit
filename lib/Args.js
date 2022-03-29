const ARG_OPTIONS = {
    NODE_VERSION: 'version',
    HELP: 'help',
    NO_UPDATE: 'no-update',
    FULL_UPDATE: 'full-update',
    FAIL_SECURITY: 'fail-security',
    FAIL_SUPPORT: 'fail-support',
    FAIL_PATCH: 'fail-patch',
    FAIL_LATEST: 'fail-latest',
    SILENT: 'silent',
    V_WARNING: 'v',
    V_INFO: 'vv',
    V_DEBUG: 'vvv',
};

function Args() {}

Args[ARG_OPTIONS.NODE_VERSION] = null;
Args[ARG_OPTIONS.HELP] = false;
Args[ARG_OPTIONS.NO_UPDATE] = false;
Args[ARG_OPTIONS.FULL_UPDATE] = false;
Args[ARG_OPTIONS.FAIL_SECURITY] = false;
Args[ARG_OPTIONS.FAIL_SUPPORT] = false;
Args[ARG_OPTIONS.FAIL_PATCH] = false;
Args[ARG_OPTIONS.FAIL_LATEST] = false;
Args[ARG_OPTIONS.V_WARNING] = false;
Args[ARG_OPTIONS.V_INFO] = false;
Args[ARG_OPTIONS.V_DEBUG] = false;

module.exports = {
    Args,
    ARG_OPTIONS,
};
