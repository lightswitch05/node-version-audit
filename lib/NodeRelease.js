const { CveId } = require('./CveId');

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

module.exports = {
    NodeRelease,
};
