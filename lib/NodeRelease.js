const { CveId } = require('./CveId');
const { NodeVersion } = require('./NodeVersion');

/**
 *
 * @param {NodeVersion} version
 * @constructor
 */
function NodeRelease(version) {
    this.version = version;
    this.releaseDate = null;
    this.patchedCveIds = [];
}

/**
 * @param {CveId} newCveId
 */
NodeRelease.prototype.addPatchedCveId = function (newCveId) {
    for (let i = 0; i < this.patchedCveIds.length; i++) {
        const difference = CveId.compare(this.patchedCveIds[i], newCveId);
        if (difference === 0) {
            return;
        } else if (difference > 0) {
            this.patchedCveIds.splice(i, 0, newCveId);
            return;
        }
    }
    this.patchedCveIds.push(newCveId);
};

/**
 * @param {NodeRelease} first
 * @param {NodeRelease} second
 * @return {number}
 */
NodeRelease.compare = (first, second) => {
    return NodeVersion.compare(first.version, second.version);
};

module.exports = {
    NodeRelease,
};
