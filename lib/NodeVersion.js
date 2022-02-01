/**
 * @param {number} major
 * @param {number} minor
 * @param {number} patch
 * @constructor
 */
function NodeVersion(major, minor, patch) {
    this.major = major;
    this.minor = minor;
    this.patch = patch;
}

/**
 * Initialize from a string
 * @param {string|null} fullVersion
 * @returns {null|NodeVersion}
 */
NodeVersion.fromString = (fullVersion) => {
    const matches = /^(\d+)\.(\d+)\.(\d+)$/g.exec(fullVersion);
    if (!matches || matches.length !== 4) {
        return null;
    }
    const major = parseInt(matches[1], 10);
    const minor = parseInt(matches[2], 10);
    const patch = parseInt(matches[3], 10);
    if ([major, minor, patch].includes(NaN)) {
        return null;
    }
    return new NodeVersion(major, minor, patch);
};

/**
 * @param {NodeVersion} first
 * @param {NodeVersion} second
 * @return number difference
 */
NodeVersion.compare = function (first, second) {
    if (!first && !second) {
        return 0;
    }
    if (!first) {
        return -1;
    }
    if (!second) {
        return 1;
    }
    if (first.major !== second.major) {
        return first.major - second.major;
    }
    if (first.minor !== second.minor) {
        return first.minor - second.minor;
    }
    if (first.patch !== second.patch) {
        return first.patch - second.patch;
    }
    return 0;
};

module.exports = {
    NodeVersion,
};
