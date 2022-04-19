const { ParseException } = require('./Exceptions');

/**
 * @param {string} id
 * @constructor
 * @private
 */
function CveId(id) {
    const matches = id.match(/CVE-(\d{4})-(\d+)/i);
    this.year = parseInt(matches[1]);
    this.sequenceNumber = parseInt(matches[2]);
    this.id = `CVE-${this.year}-${this.sequenceNumber}`;
}

/**
 * @param {string} cveId
 * @throws {ParseException}
 * @return {CveId}
 */
CveId.fromString = (cveId) => {
    if (/CVE-(\d{4})-(\d+)/i.test(cveId)) {
        return new CveId(cveId);
    }
    throw ParseException.fromString(`Unable to parse CVE: ${cveId}`);
};

/**
 * @param {CveId} first
 * @param {CveId} second
 * @return {number} difference
 */
CveId.compare = (first, second) => {
    if (!first && !second) {
        return 0;
    }
    if (!first) {
        return -1;
    }
    if (!second) {
        return 1;
    }
    if (first.year !== second.year) {
        return first.year - second.year;
    }
    return first.sequenceNumber - second.sequenceNumber;
};

/**
 * @return {string}
 */
CveId.prototype.toJSON = function () {
    return this.toString();
};

/**
 * @return {string}
 */
CveId.prototype.toString = function () {
    return this.id;
};

module.exports = {
    CveId,
};
